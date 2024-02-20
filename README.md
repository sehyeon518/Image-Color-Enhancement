# Image Color Enhancement

이 프로젝트는 이미지의 색상을 강조하여 시각적으로 눈에 잘 띄도록 만드는 코드가 포함되어 있습니다. 

낮은 대비 또는 조명에 따른 색상 불균형과 같은 문제를 해결하여 이미지의 색상 구도를 개선하고 더 생동감 있는 이미지로 만드는 것을 목표로 합니다.


## Features
- AGCWD
    ```python
    def image_agcwd(img, a=0.25, truncated_cdf=False, normalize=1.5):
        """
        Applies Automatic Global Contrast Enhancement with Weighted Distribution (AGCWD) to an input image.

        Parameters:
        - img (numpy.ndarray): Y channel of the input image.
        - a (float): Exponential parameter for adjusting the enhancement strength. Default is 0.25.
        - truncated_cdf (bool): Flag to indicate whether to use truncated cumulative distribution function.
                            If True, enhances the image with a truncated inverse cumulative distribution function.
                            If False, enhances the image with the inverse cumulative distribution function. Default is False.
        - normalize (float): Scaling factor for normalizing the enhanced image. Default is 1.5.

        Returns:
        - numpy.ndarray: Enhanced image after AGCWD.

        Note:
        AGCWD is a contrast enhancement technique that adjusts the intensity distribution of the image to improve visual quality.
        The function works on the Y channel of the input image (assuming YUV or similar color space).
        """
    ```
    - `histogram`: Y 채널에 대한 histogram(256, )
    - `cdf`: Y 채널에 대한 histogram 누적합(256, )
    - `cdf_normalized`: cdf 정규화(0~2 사이로 변경)(256, )
    - `prob_normalized`: histogram 총합이 1이되게 정규화(256, )

        ![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/5cb2bf5e-8910-4692-93b7-44ca9e59d5d7)

    - `unique_intensity`: img(Y 채널)에서 중복 제거
    - `probmin`, `prob_max`: 정규화했을 때 가장 가능성 높은 Y 값(0.013)과 가장 낮은 Y 값(0.0)
    - `pn_temp`: 전체 probability 차이(max - min) 중에서 현재 픽셀이 얼마나 밝은지(각 값을 0~1 범위로 정규화)
        
        ![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/3ea98e79-9ad6-4362-ae26-23d0e1500489)
        
    - `prob_normalized_wd`: pn_temp 총합이 임의의 normalize가 되게 조절

        > **총합이 1이 되게 정규화하면 이미지가 밝아지는 데 한계가 있는 것을 확인**

        ![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/4b2cd745-2fa8-4500-b906-2d5a7d1470b5)
        
        `original` -> `normalize 0 ~ 1` -> `normalize 0 ~ 1.5`, `normalize 0 ~ 2.0`
        
    - `cdf_prob_normalized_wd`: prob_normalized의 누적합
        
        ![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/9d97a285-2d8d-4436-afec-7ec3283494fc)
        
    - `inverse_cdf`: True이면 cdf에서 0.5보다 작은 부분은 0.5로 처리함
    - `img_new`: 새로운 Y 채널
        
        
        $newIntensity=round(255×(i ÷ 255) ^ {inversecdf[i]})$

- Color Enhancement
    ```python
    def enhance_color(img, factor=1.2, count=1):
        """
        Enhances the color of an image by adjusting the red, green, and blue values
        based on a specified enhancement factor.

        Parameters:
        - img (numpy.ndarray): Input image as a NumPy array. It should have shape (height, width, 3) 
        representing the RGB channels.
        - factor (float): Enhancement factor determining the strength of color enhancement. 
        Should be in the range [1.0, 3.0].
        - count (int): Number of iterations to apply the enhancement. Each iteration further enhances 
        the color based on the previous result.

        Returns:
        - numpy.ndarray: The color-enhanced image as a NumPy array with values in the range [0, 255].
        """
    ```
## Examples

아래는 색상 강조 전후의 이미지 예시입니다:

![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/11fb584a-41ea-4946-9c06-3d06a74e47e3)

![image](https://github.com/sehyeon518/Favorfit-Color-Equalization/assets/84698896/937466c6-574c-41e3-9407-6919ab067351)

## References
- Color Enhancement - [참고링크](https://irsa.ipac.caltech.edu/applications/FinderChart/docs/color_enhance.html)
- Image Adaptive Gamma Correction with Weighted Distribution - [참고링크](https://github.com/leowang7/iagcwd)