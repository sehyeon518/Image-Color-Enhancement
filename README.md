# Image Color Enhancement

이 프로젝트는 이미지의 색상을 강조하여 시각적으로 눈에 잘 띄도록 만드는 코드가 포함되어 있습니다. 

조명 조건의 부족, 낮은 대비 또는 색상 불균형과 같은 문제를 해결하여 이미지의 색상 구도를 개선하여 더 생동감 있는 이미지로 만드는 것을 목표로 합니다.


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

## References
- Color Enhancement - [참고링크](https://irsa.ipac.caltech.edu/applications/FinderChart/docs/color_enhance.html)
- Image Adaptive Gamma Correction with Weighted Distribution - [참고링크](https://github.com/leowang7/iagcwd)