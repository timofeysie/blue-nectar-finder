# Stair Tracker

src\hooks\useStairDetection.ts

This solution:

1. Uses acceleration patterns to detect potential steps
2. Confirms steps using device orientation (tilt)
3. Implements a cooldown period to prevent double-counting steps
4. Estimates elevation gain based on typical stair height
5. Provides real-time feedback about climbing status

Keep in mind:

- This is a basic implementation and might need tuning of the thresholds based on testing
- Device motion sensor accuracy varies between devices
- The elevation calculation is an estimate based on average stair height
- You might want to add data smoothing or additional filters for more accurate detection

We can improve accuracy by:

- Adding a moving average for acceleration values
- Implementing more sophisticated pattern recognition
- Calibrating thresholds based on user movement patterns
- Adding machine learning for better pattern recognition

## Algorithms

This type of motion analysis is often associated with several algorithms and techniques commonly used in activity recognition and step detection:

### Peak Detection Algorithms

- Simple peak detection with thresholds (what we implemented basically)
- Zero-crossing detection
- Pan-Tompkins algorithm (commonly used for step detection)

### Hidden Markov Models (HMM)

- Used for activity state transitions
- Can differentiate between walking, climbing stairs, running, etc.

### Dynamic Time Warping (DTW)

- Compares motion patterns against known templates
- Particularly useful for recognizing specific movements like stair climbing

### Machine Learning Approaches

- Support Vector Machines (SVM)
- Random Forests
- Neural Networks, particularly CNN (Convoluted Neural Network) and RNN (Recurrent Neural Network)

## Enhancements

An enhanced version includes:

- Moving Average Filter
- Reduces noise in the acceleration data
- Helps prevent false positives

### Hysteresis-based Peak Detection

- Uses separate thresholds for peaks and valleys
- More robust against small fluctuations

### Time-based Constraints  

- Minimum time between steps
- Automatic reset of climbing status

For even more accuracy, you could implement:

- Kalman Filter

## Fine-tune the stair detection for the current Peak Detection algorithm

In the src\hooks\useStairDetection.ts we have this debug data:

```js
const [debugData, setDebugData] = useState({
    currentAcceleration: 0,    // Raw Z-axis acceleration
    avgAcceleration: 0,        // Moving average of Z-axis acceleration
    isPotentialStep: false,    // Step detection state
    betaAngle: 0,             // Device tilt angle
});
```

Here's how each property helps with stair detection calibration.

### 1. currentAcceleration

- This is the raw Z-axis acceleration value from the device's accelerometer
- Shows the immediate up/down movement of the device
- Monitoring this helps you understand:
  - How "noisy" the sensor data is
  - The magnitude of acceleration during actual stair climbing vs. normal walking
  - If the sensor is providing reasonable values (should typically be around ±1g when stationary)

### 2. avgAcceleration

- A moving average of the last windowSize acceleration readings
- Smooths out sensor noise
- Used to detect steps by comparing against peakThreshold and valleyThreshold
- Monitoring this helps you:
  - Adjust windowSize (larger window = smoother but more delayed detection)
  - Fine-tune peakThreshold and valleyThreshold values
  - If avgAcceleration rarely crosses your thresholds, they might be too high

### 3. isPotentialStep

- Boolean flag indicating whether the algorithm detected a potential step
- True when avgAcceleration exceeds peakThreshold
- False when it drops below valleyThreshold
- Monitoring this helps you:
  - Verify if the step detection timing is correct
  - Adjust minCycleTime if steps are being detected too frequently
  - Check if false positives are occurring during non-stair activities

### 4. betaAngle

- Device tilt angle in degrees (rotation around X-axis)
- Used to distinguish stair climbing from normal walking
- Monitoring this helps you:
  - Adjust betaMin and betaMax values
  - Typical stair climbing angles are between 20-60 degrees
  - If steps aren't being counted, check if the betaAngle falls within your min/max range
  - If false positives occur, you might need to narrow the angle range

To improve accuracy:

- First monitor currentAcceleration and avgAcceleration during stair climbing
- Adjust windowSize, peakThreshold, and valleyThreshold based on the observed patterns
- Watch isPotentialStep to ensure steps are being detected at appropriate times
- Finally, use betaAngle to filter out non-stair movements by adjusting betaMin and betaMax
