import cv2
import numpy as np
import os


def resize_image(img):
    height, width = img.shape[:2]

    min_dim = min(height, width)

    start_h = (height - min_dim) // 2
    end_h = start_h + min_dim
    start_w = (width - min_dim) // 2
    end_w = start_w + min_dim

    cropped_resized_img = cv2.resize(img[start_h:end_h, start_w:end_w], (512, 512))

    return cropped_resized_img


def image_agcwd(img, a=0.25, truncated_cdf=False):
    h, w = img.shape[:2]
    hist, bins = np.histogram(img.flatten(), 256, [0, 256])  # Y 채널에 대한 hist
    cdf = hist.cumsum()  # 각 멤버값을 누적하여 더한 값을 멤버로 하는 1차원 배열을 생성

    cdf_normalized = cdf / cdf.max()
    prob_normalized = hist / hist.sum()

    unique_intensity = np.unique(img)
    intensity_max = unique_intensity.max()
    intensity_min = unique_intensity.min()
    prob_min = prob_normalized.min()
    prob_max = prob_normalized.max()

    pn_temp = (prob_normalized - prob_min) / (prob_max - prob_min)
    pn_temp[pn_temp > 0] = prob_max * (pn_temp[pn_temp > 0] ** a)
    pn_temp[pn_temp < 0] = prob_max * (-((-pn_temp[pn_temp < 0]) ** a))
    prob_normalized_wd = pn_temp / pn_temp.sum()  # normalize to [0,1]
    cdf_prob_normalized_wd = prob_normalized_wd.cumsum()

    if truncated_cdf:
        inverse_cdf = np.maximum(0.5, 1 - cdf_prob_normalized_wd)
    else:
        inverse_cdf = 1 - cdf_prob_normalized_wd

    img_new = img.copy()
    for i in unique_intensity:
        img_new[img == i] = np.round(255 * (i / 255) ** inverse_cdf[i])

    return img_new


def process_bright(img): # 밝은 이미지를 어둡게
    img_negative = 255 - img
    agcwd = image_agcwd(img_negative, a=0.25, truncated_cdf=False)
    reversed_agcwd = 255 - agcwd
    return reversed_agcwd


def process_dimmed(img): # 어두운 이미지를 밝게
    agcwd = image_agcwd(img, a=1.0, truncated_cdf=True)
    return agcwd


def image_brightness(img):
    YCrCb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    Y = YCrCb[:, :, 0]

    threshold = 0.3
    exp_in = 112
    M, N = img.shape[:2]
    mean_in = np.sum(Y / (M * N))
    t = (mean_in - exp_in) / exp_in

    # Process image for gamma correction
    img_output = None
    if t < -threshold:  # 어두운 이미지
        print("Dimmed Image")
        result = process_dimmed(Y)
        YCrCb[:, :, 0] = result
        img_output = cv2.cvtColor(YCrCb, cv2.COLOR_YCrCb2BGR)
    elif t > threshold:  # 밝은 이미지
        print("Bright Image")
        result = process_bright(Y)
        YCrCb[:, :, 0] = result
        img_output = cv2.cvtColor(YCrCb, cv2.COLOR_YCrCb2BGR)
    else:
        img_output = img
    return img_output


def enhance_color(img, factor=1.2, count=1):
    dst = img
    
    for _ in range(count):
        max_rgb = np.max(dst, axis=-1, keepdims=True)
        max_rgb_nonzero = np.where(max_rgb == 0, 1, max_rgb)
        dst = (dst / max_rgb_nonzero) ** factor * max_rgb

        dst = dst.astype(np.uint8)

    return dst.astype(np.uint8)


def main():
    pwd = os.path.dirname(os.path.realpath(__file__))
    img_path = os.path.join(pwd, "Images", "cup.jpg")
    src = cv2.imread(img_path)

    src = resize_image(src)
    cv2.imshow("src", src)

    brightened = image_brightness(src)
    cv2.imshow("brightened", brightened)
    
    enhanced = enhance_color(brightened, factor=1.1, count=2)
    cv2.imshow("enhanced", enhanced)


if __name__ == "__main__":
    main()
    cv2.waitKey()
    cv2.destroyAllWindows()
