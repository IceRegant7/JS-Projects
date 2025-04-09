document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('password');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate-btn');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strength-value');
    const notification = document.getElementById('notification');
    
    // Character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Update length value display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        updateStrengthMeter();
    });
    
    // Generate password button click
    generateBtn.addEventListener('click', function() {
        // Add click animation
        this.classList.add('clicked');
        setTimeout(() => {
            this.classList.remove('clicked');
        }, 300);
        
        generatePassword();
    });
    
    // Copy to clipboard button click
    copyBtn.addEventListener('click', function() {
        if (!passwordInput.value) return;
        
        passwordInput.select();
        document.execCommand('copy');
        
        // Show notification
        showNotification('Password copied to clipboard!');
    });
    
    // Checkbox changes
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // At least one option must be selected
            if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked && 
                !numbersCheckbox.checked && !symbolsCheckbox.checked) {
                this.checked = true;
                showNotification('At least one character type must be selected');
            } else {
                generatePassword();
            }
        });
    });
    
    // Generate password function
    function generatePassword() {
        const length = lengthSlider.value;
        let chars = '';
        let password = '';
        
        // Build character set based on selected options
        if (uppercaseCheckbox.checked) chars += uppercaseChars;
        if (lowercaseCheckbox.checked) chars += lowercaseChars;
        if (numbersCheckbox.checked) chars += numberChars;
        if (symbolsCheckbox.checked) chars += symbolChars;
        
        // Generate password
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        
        passwordInput.value = password;
        updateStrengthMeter();
    }
    
    // Update password strength meter
    function updateStrengthMeter() {
        const length = lengthSlider.value;
        let strength = 0;
        
        // Reset classes
        document.querySelector('.strength-meter').className = 'strength-meter';
        
        // Length contributes to strength
        strength += Math.min(Math.floor(length / 4), 5); // Max 5 points for length
        
        // Character variety contributes to strength
        let typesSelected = 0;
        if (uppercaseCheckbox.checked) typesSelected++;
        if (lowercaseCheckbox.checked) typesSelected++;
        if (numbersCheckbox.checked) typesSelected++;
        if (symbolsCheckbox.checked) typesSelected++;
        
        strength += typesSelected * 2; // 2 points per type
        
        // Determine strength level
        let strengthClass, strengthLabel;
        if (strength <= 5) {
            strengthClass = 'strength-weak';
            strengthLabel = 'Weak';
        } else if (strength <= 8) {
            strengthClass = 'strength-medium';
            strengthLabel = 'Medium';
        } else {
            strengthClass = 'strength-strong';
            strengthLabel = 'Strong';
        }
        
        // Apply strength class and update text
        document.querySelector('.strength-meter').classList.add(strengthClass);
        strengthText.textContent = strengthLabel;
    }
    
    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Generate initial password
    generatePassword();
});