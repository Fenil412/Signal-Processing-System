# Signal Processing System 🔊

Signal Processing System is a **web-based signal analyzer** designed to visualize and process time-domain signals using **FFT (Fast Fourier Transform)**. This intuitive project simulates signal generation, mixing with noise, and signal recovery through frequency analysis using **JavaScript** and **Chart.js**.

## 🌟 Features
- **Signal Generator**: Customizable amplitude, frequency, phase, and constant offset.
- **Noise Simulation**: Add configurable noise components to test signal recovery.
- **Fourier Analysis**: Applies **FFT** for frequency-domain decomposition and inverse FFT for recovery.
- **Equation Rendering**: Displays formatted mathematical representation of each signal.
- **Interactive Charts**: Uses **Chart.js** for clean, responsive plotting of signal waveforms.

## 📦 Frontend Technologies
- **HTML5 & CSS3**: Structure and styling using modern web standards.
- **JavaScript (Vanilla)**: Handles signal math, FFT, and dynamic DOM updates.
- **Chart.js**: Visualizes signal data in interactive line graphs.
- **Responsive UI**: Clean design with mobile-friendly layout.

## 🔧 Project Structure

```
📁 root/
│
├── index.html          # Main UI layout and structure
├── styles.css          # Styling using modern responsive design
├── script.js           # Signal processing logic and chart generation
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/signal-processing-system.git
cd signal-processing-system
```

### 2️⃣ Run the Application
Just open `index.html` in your browser — no server required.

## 🛠️ Customize Your Signal

Edit signal parameters directly in the UI:
- Amplitude
- Frequency
- Phase (in radians)
- Constant offset

Press **"Process Signals"** to visualize the original, noise, composite, and recovered signals.

## 💡 Signal Recovery Method

> **Fast Fourier Transform (FFT)** is used to analyze the frequency spectrum of the composite signal. By isolating dominant frequency components that resemble the original signal, it applies inverse FFT to reconstruct the cleaned signal.

## 🔄 Contributing

### 1️⃣ Fork the Project
```bash
git clone https://github.com/your-username/signal-processing-system.git
cd signal-processing-system
```

### 2️⃣ Create a New Feature Branch
```bash
git checkout -b add-enhanced-filtering
```

### 3️⃣ Make Your Changes and Commit
```bash
git add .
git commit -m "Added enhanced signal filtering algorithm"
```

### 4️⃣ Push and Create Pull Request
```bash
git push origin add-enhanced-filtering
```

## 🎯 Why This Project?
- **Educational Utility**: Visualize signal theory and FFT practically.
- **Pure Frontend**: No backend required — runs in browser.
- **Real-Time Feedback**: Instant visualization of signal transformations.

## 📜 License
This project is licensed under the **MIT License**.

---

🔊 **Analyze, Visualize, and Recover — All in the Browser!** 🌐
```
