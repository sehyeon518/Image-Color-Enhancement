// Function to resize the image
function resizeImage(img) {
    const { height, width } = img.shape;
    const minDim = Math.min(height, width);
    const startH = Math.floor((height - minDim) / 2);
    const endH = startH + minDim;
    const startW = Math.floor((width - minDim) / 2);
    const endW = startW + minDim;

    const croppedResizedImg = cv.resize(img.roi(new cv.Rect(startW, startH, minDim, minDim)), new cv.Size(512, 512));

    return croppedResizedImg;
}

// Function for AGCWD (Adaptive Gamma Correction with Weighted Distribution)
function imageAGCWD(img, a = 0.25, truncatedCDF = false, normalize = 1.5) {
    const { height, width } = img.size();
    const hist = new cv.Mat();
    const bins = 256;

    cv.calcHist([img], [0], new cv.Mat(), hist, [bins], [0, 256]);

    const cdf = hist.cumulativeDistribution();

    const cdfNormalized = cdf.div(cdf.get(-1).data32F[0]);
    const probNormalized = hist.div(hist.reduce(cv.Reduction.SUM).data32F[0]);

    const uniqueIntensity = Array.from(new Set(img.data32F));
    const intensityMax = Math.max(...uniqueIntensity);
    const intensityMin = Math.min(...uniqueIntensity);
    const probMin = Math.min(...probNormalized.data32F);
    const probMax = Math.max(...probNormalized.data32F);

    const pnTemp = probNormalized.subScalar(probMin).divScalar(probMax - probMin);
    pnTemp.forEach((value, index) => {
        if (value > 0) {
            pnTemp.data32F[index] = probMax * Math.pow(value, a);
        } else {
            pnTemp.data32F[index] = probMax * Math.pow(-Math.pow(-value, a));
        }
    });

    const probNormalizedWD = pnTemp.divScalar(pnTemp.reduce(cv.Reduction.SUM).data32F[0]).mulScalar(normalize);
    const cdfProbNormalizedWD = probNormalizedWD.cumulativeDistribution();

    const inverseCDF = truncatedCDF ? cdfProbNormalizedWD.max().sub(cdfProbNormalizedWD).max(normalize / 2) : normalize - cdfProbNormalizedWD;

    const imgNew = img.clone();
    uniqueIntensity.forEach((i) => {
        imgNew.setTo(new cv.Scalar(255 * Math.pow(i / 255, inverseCDF.data32F[i])), imgNew.equal(i));
    });

    return imgNew;
}

// Function to process bright images
function processBright(img) {
    const imgNegative = img.clone().subScalar(255);
    const agcwd = imageAGCWD(imgNegative, 0.25, false);
    const reversedAGCWD = agcwd.clone().subScalar(255);
    return reversedAGCWD;
}

// Function to process dimmed images
function processDimmed(img) {
    const agcwd = imageAGCWD(img, 0.75, true);
    return agcwd;
}

// Function to adjust image brightness based on Y channel
function imageBrightness(img) {
    const yCrCb = cv.cvtColor(img, cv.COLOR_BGR2YCrCb);
    const yChannel = yCrCb.split()[0];

    const threshold = 0.3;
    const expIn = 112;
    const [m, n] = [img.rows, img.cols];
    const meanIn = cv.mean(yChannel)[0] / (m * n);
    const t = (meanIn - expIn) / expIn;

    let imgOutput = null;

    if (t < -threshold) {
        console.log("Dimmed Image");
        const result = processDimmed(yChannel);
        yCrCb.set(0, result);
        imgOutput = cv.cvtColor(yCrCb, cv.COLOR_YCrCb2BGR);
    } else if (t > threshold) {
        console.log("Bright Image");
        const result = processBright(yChannel);
        yCrCb.set(0, result);
        imgOutput = cv.cvtColor(yCrCb, cv.COLOR_YCrCb2BGR);
    } else {
        imgOutput = img.clone();
    }

    return imgOutput;
}

// Function to enhance image color
function enhanceColor(img, factor = 1.2, count = 1) {
    let dst = img.clone();

    for (let i = 0; i < count; i++) {
        const maxRGB = dst.reduce(cv.Reduction.MAX, -1);
        const maxRGBNonZero = maxRGB.eq(0).bitwise_not();
        dst = dst.mul(maxRGBNonZero.powScalar(factor).div(maxRGBNonZero).mul(maxRGB));

        dst.convertTo(dst, cv.CV_8U);
    }

    return dst;
}

// Main function
function main(image) {
    let src = cv.imread(image);
    src = resizeImage(src);
    cv.imshow("src", src);

    const brightened = imageBrightness(src);
    cv.imshow("brightened", brightened);

    const enhanced = enhanceColor(brightened, 1.7);
    cv.imshow("enhanced", enhanced);

    return enhanced;
}

// Entry point
document.addEventListener("DOMContentLoaded", function () {
    const imgPath = "Images/cup.jpg";
    cv.onRuntimeInitialized = () => {
        const src = cv.imread(imgPath);
        main(src);
        cv.waitKey();
        cv.destroyAllWindows();
    };
});
