document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const processBtn = document.getElementById('process-btn');
    
    // Initial charts setup with empty data
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Amplitude'
                }
            }
        }
    };
    
    // Initialize charts with empty data
    const originalChart = new Chart(
        document.getElementById('original-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Original Signal',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: chartOptions
        }
    );
    
    const noiseChart = new Chart(
        document.getElementById('noise-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Noise Signal',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: chartOptions
        }
    );
    
    const compositeChart = new Chart(
        document.getElementById('composite-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Composite Signal',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }]
            },
            options: chartOptions
        }
    );
    
    const recoveredChart = new Chart(
        document.getElementById('recovered-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Recovered Signal',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1
                }]
            },
            options: chartOptions
        }
    );
    
    // Function to generate time values
    function generateTimeValues(duration, sampleRate) {
        const points = duration * sampleRate;
        const timeValues = [];
        
        for (let i = 0; i < points; i++) {
            timeValues.push(i / sampleRate);
        }
        
        return timeValues;
    }
    
    // Function to generate signal values
    function generateSignalValues(timeValues, amplitude, frequency, phase, constant) {
        return timeValues.map(t => {
            return amplitude * Math.sin(2 * Math.PI * frequency * t + phase) + constant;
        });
    }
    
    // Function to create the composite signal
    function createCompositeSignal(originalValues, noiseValues) {
        return originalValues.map((val, index) => val + noiseValues[index]);
    }
    
    // Performs an in-place complex-to-complex FFT
    function fftRadix2(real, imag) {
        const n = real.length;
        
        // Check if n is a power of 2
        if ((n & (n - 1)) !== 0) {
            throw new Error("FFT length must be a power of 2");
        }
        
        // Bit reversal
        let j = 0;
        for (let i = 0; i < n - 1; i++) {
            if (i < j) {
                // Swap real parts
                [real[i], real[j]] = [real[j], real[i]];
                // Swap imaginary parts
                [imag[i], imag[j]] = [imag[j], imag[i]];
            }
            
            let k = n >> 1;
            while (k <= j) {
                j -= k;
                k >>= 1;
            }
            j += k;
        }
        
        // Compute FFT
        for (let l = 2; l <= n; l <<= 1) {
            const m = l >> 1;
            
            // Calculate twiddle factors
            const angleStep = -2 * Math.PI / l;
            
            for (let k = 0; k < n; k += l) {
                for (let j = 0; j < m; j++) {
                    const angle = j * angleStep;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    
                    const aRe = real[k + j];
                    const aIm = imag[k + j];
                    const bRe = real[k + j + m];
                    const bIm = imag[k + j + m];
                    
                    const tRe = cos * bRe - sin * bIm;
                    const tIm = cos * bIm + sin * bRe;
                    
                    real[k + j] = aRe + tRe;
                    imag[k + j] = aIm + tIm;
                    real[k + j + m] = aRe - tRe;
                    imag[k + j + m] = aIm - tIm;
                }
            }
        }
    }
    
    // Function to perform FFT
    function performFFT(signal, inverse = false) {
        const n = signal.length;
        const real = [...signal];
        const imag = new Array(n).fill(0);
        
        // If inverse FFT, negate the imaginary part
        if (inverse) {
            // First compute the normal FFT
            fftRadix2(real, imag);
            
            // Then conjugate and scale
            for (let i = 0; i < n; i++) {
                imag[i] = -imag[i] / n;
                real[i] = real[i] / n;
            }
        } else {
            fftRadix2(real, imag);
        }
        
        return { real, imag };
    }
    
    // Function to compute magnitude of complex numbers
    function computeMagnitudes(real, imag) {
        return real.map((re, i) => Math.sqrt(re * re + imag[i] * imag[i]));
    }
    
    // Function to filter frequency domain data
    function bandpassFilter(real, imag, targetFreq, sampleRate, bandwidth = 0.5) {
        const n = real.length;
        const filteredReal = [...real];
        const filteredImag = [...imag];
        
        // Calculate frequency resolution
        const freqResolution = sampleRate / n;
        
        // Find target bin
        const targetBin = Math.round(targetFreq / freqResolution);
        const bandwidthBins = Math.round(bandwidth / freqResolution);
        
        // Apply filter - zero out frequencies outside the target band
        for (let i = 0; i < n; i++) {
            // Keep the DC component
            if (i === 0) continue;
            
            // Check if the bin is within the target bandwidth
            const binDist = Math.min(
                Math.abs(i - targetBin),
                Math.abs(i - (n - targetBin))
            );
            
            if (binDist > bandwidthBins) {
                filteredReal[i] = 0;
                filteredImag[i] = 0;
            }
        }
        
        return { real: filteredReal, imag: filteredImag };
    }
    
    // Function to round number for display
    function round(number, decimals = 2) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    // Function to format equation
    function formatEquation(amplitude, frequency, phase, constant) {
        let equation = '';
        
        if (amplitude !== 0) {
            equation += `${round(amplitude)} × sin(2π × ${round(frequency)}t`;
            
            if (phase !== 0) {
                equation += ` + ${round(phase)})`;
            } else {
                equation += ')';
            }
        }
        
        if (constant !== 0) {
            if (equation) {
                if (constant > 0) {
                    equation += ` + ${round(constant)}`;
                } else {
                    equation += ` - ${Math.abs(round(constant))}`;
                }
            } else {
                equation = `${round(constant)}`;
            }
        }
        
        if (!equation) {
            equation = '0';
        }
        
        return equation;
    }
    
    // Function to find the next power of 2
    function nextPowerOf2(n) {
        let power = 1;
        while (power < n) {
            power *= 2;
        }
        return power;
    }
    
    // Function to estimate signal parameters from time-domain data
    function estimateSignalParameters(signal, timeValues) {
        // Find max and min to get amplitude and constant
        const max = Math.max(...signal);
        const min = Math.min(...signal);
        const amplitude = (max - min) / 2;
        const constant = (max + min) / 2;
        
        // Find zero crossings to estimate frequency
        let zeroCrossings = 0;
        for (let i = 1; i < signal.length; i++) {
            if ((signal[i - 1] - constant) * (signal[i] - constant) < 0) {
                zeroCrossings++;
            }
        }
        
        // Calculate frequency: zero crossings / 2 (for complete cycles) / time duration
        const frequency = zeroCrossings / 2 / (timeValues[timeValues.length - 1] - timeValues[0]);
        
        // Phase is harder to estimate accurately without a reference
        // For simplicity, we'll use 0 or try to detect the phase at t=0
        let phase = 0;
        if (signal.length > 0 && amplitude !== 0) {
            phase = Math.asin((signal[0] - constant) / amplitude);
        }
        
        return { amplitude, frequency, phase, constant };
    }
    
    // Event listener for the process button
    processBtn.addEventListener('click', function() {
        // Get signal parameters
        const originalAmplitude = parseFloat(document.getElementById('original-amplitude').value);
        const originalFrequency = parseFloat(document.getElementById('original-frequency').value);
        const originalPhase = parseFloat(document.getElementById('original-phase').value);
        const originalConstant = parseFloat(document.getElementById('original-constant').value);
        
        const noiseAmplitude = parseFloat(document.getElementById('noise-amplitude').value);
        const noiseFrequency = parseFloat(document.getElementById('noise-frequency').value);
        const noisePhase = parseFloat(document.getElementById('noise-phase').value);
        const noiseConstant = parseFloat(document.getElementById('noise-constant').value);
        
        // Set up signal parameters
        const duration = 5; // seconds
        const sampleRate = 256; // samples per second (increased for better resolution)
        
        // Generate time values
        const timeValues = generateTimeValues(duration, sampleRate);
        
        // Generate signal values
        const originalValues = generateSignalValues(timeValues, originalAmplitude, originalFrequency, originalPhase, originalConstant);
        const noiseValues = generateSignalValues(timeValues, noiseAmplitude, noiseFrequency, noisePhase, noiseConstant);
        
        // Create composite signal
        const compositeValues = createCompositeSignal(originalValues, noiseValues);
        
        // Make sure the signal length is a power of 2 for FFT
        const paddedLength = nextPowerOf2(compositeValues.length);
        
        // Pad the signal with zeros
        const paddedSignal = [...compositeValues];
        while (paddedSignal.length < paddedLength) {
            paddedSignal.push(0);
        }
        
        // Perform FFT
        const fftResult = performFFT(paddedSignal);
        
        // Apply bandpass filter centered on the original frequency
        const filteredFFT = bandpassFilter(
            fftResult.real, 
            fftResult.imag, 
            originalFrequency, 
            sampleRate, 
            originalFrequency * 0.5 // Bandwidth proportional to frequency
        );
        
        // Perform inverse FFT to recover the signal
        const recoveredResult = performFFT(filteredFFT.real, true);
        
        // Extract the real part of the recovered signal (first part up to original length)
        const recoveredValues = recoveredResult.real.slice(0, timeValues.length);
        
        // Estimate parameters of the recovered signal
        const recoveredParams = estimateSignalParameters(recoveredValues, timeValues);
        
        // Update charts
        updateChart(originalChart, timeValues, originalValues, 'Original Signal');
        updateChart(noiseChart, timeValues, noiseValues, 'Noise Signal');
        updateChart(compositeChart, timeValues, compositeValues, 'Composite Signal');
        updateChart(recoveredChart, timeValues, recoveredValues, 'Recovered Signal');
        
        // Update equations
        document.getElementById('original-equation').textContent = 'y(t) = ' + formatEquation(originalAmplitude, originalFrequency, originalPhase, originalConstant);
        document.getElementById('noise-equation').textContent = 'y(t) = ' + formatEquation(noiseAmplitude, noiseFrequency, noisePhase, noiseConstant);
        document.getElementById('composite-equation').textContent = 'y(t) = ' + formatEquation(originalAmplitude, originalFrequency, originalPhase, originalConstant) + ' + ' + formatEquation(noiseAmplitude, noiseFrequency, noisePhase, noiseConstant);
        
        // Update recovered equation with estimated parameters
        document.getElementById('recovered-equation').textContent = 'y(t) ≈ ' + 
            formatEquation(recoveredParams.amplitude, recoveredParams.frequency, recoveredParams.phase, recoveredParams.constant);
    });
    
    // Function to update chart
    function updateChart(chart, xValues, yValues, label) {
        chart.data.labels = xValues;
        chart.data.datasets[0].data = yValues;
        chart.data.datasets[0].label = label;
        chart.update();
    }
    
    // Initialize with default values
    processBtn.click();
});