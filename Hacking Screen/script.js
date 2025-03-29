// Matrix background effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*(){}[]<>/\\|~";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 33);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMatrix);
// Terminal with continuous fake code generation
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    
    // Components for generating fake code
    const functions = ['hackMainframe', 'bypassSecurity', 'injectPayload', 
                     'decryptData', 'encryptData', 'scrambleSignature',
                     'overrideProtocol', 'forceAccess', 'crackEncryption'];
    
    const variables = ['target', 'encryptionKey', 'securityToken', 
                     'backdoor', 'payload', 'exploit', 'vulnerability',
                     'rootAccess', 'adminPrivileges'];
    
    const objects = ['system', 'network', 'database', 'firewall',
                    'server', 'mainframe', 'router', 'encryption'];
    
    const strings = ['global-network', 'admin:root', 'secret-token',
                   'top-secret', 'classified', 'forbidden-zone',
                   'maximum-security', 'restricted-area'];
    
    const numbers = ['0xFA7E81B3', '0xDEADBEEF', '0xCAFEBABE', '1337',
                   '65535', '255', '1024', '4096', '0xFFFFFFFF'];
    
    // Generate random code snippets
    function generateCodeLine() {
        const types = [
            generateVariableDeclaration,
            generateFunctionCall,
            generateControlFlow,
            generateComment,
            generateSystemMessage,
            generateTryCatch,
            generateFunctionDefinition
        ];
        
        return types[Math.floor(Math.random() * types.length)]();
    }
    
    function generateVariableDeclaration() {
        const types = ['const', 'let'];
        const type = types[Math.floor(Math.random() * types.length)];
        const varName = variables[Math.floor(Math.random() * variables.length)];
        
        if (Math.random() > 0.5) {
            // With assignment
            if (Math.random() > 0.7) {
                // String assignment
                return `<span class="keyword">${type}</span> <span class="function">${varName}</span> = <span class="string">'${strings[Math.floor(Math.random() * strings.length)]}'</span>;`;
            } else if (Math.random() > 0.5) {
                // Number assignment
                return `<span class="keyword">${type}</span> <span class="function">${varName}</span> = <span class="number">${numbers[Math.floor(Math.random() * numbers.length)]}</span>;`;
            } else {
                // Function call assignment
                const func = functions[Math.floor(Math.random() * functions.length)];
                return `<span class="keyword">${type}</span> <span class="function">${varName}</span> = <span class="function">${func}</span>();`;
            }
        } else {
            // Without assignment
            return `<span class="keyword">${type}</span> <span class="function">${varName}</span>;`;
        }
    }
    
    function generateFunctionCall() {
        const func = functions[Math.floor(Math.random() * functions.length)];
        if (Math.random() > 0.7) {
            const arg = Math.random() > 0.5 ? 
                `<span class="string">'${strings[Math.floor(Math.random() * strings.length)]}'</span>` : 
                `<span class="function">${variables[Math.floor(Math.random() * variables.length)]}</span>`;
            return `<span class="function">${func}</span>(${arg});`;
        } else {
            return `<span class="function">${func}</span>();`;
        }
    }
    
    function generateControlFlow() {
        const types = ['if', 'for', 'while'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        if (type === 'if') {
            const condition = Math.random() > 0.5 ?
                `<span class="function">${variables[Math.floor(Math.random() * variables.length)]}</span> <span class="operator">===</span> <span class="string">'${strings[Math.floor(Math.random() * strings.length)]}'</span>` :
                `<span class="function">${functions[Math.floor(Math.random() * functions.length)]}</span>()`;
            
            return `<span class="keyword">if</span> (${condition}) {`;
        } else if (type === 'for') {
            const varName = variables[Math.floor(Math.random() * variables.length)];
            return `<span class="keyword">for</span>(<span class="keyword">let</span> <span class="function">${varName}</span> = <span class="number">0</span>; <span class="function">${varName}</span> <span class="operator"><</span> <span class="number">${Math.floor(Math.random() * 1000)}</span>; <span class="function">${varName}</span><span class="operator">++</span>) {`;
        } else {
            // while
            const condition = Math.random() > 0.5 ?
                `<span class="function">${functions[Math.floor(Math.random() * functions.length)]}</span>()` :
                `<span class="function">${variables[Math.floor(Math.random() * variables.length)]}</span> <span class="operator"><</span> <span class="number">${Math.floor(Math.random() * 100)}</span>`;
            
            return `<span class="keyword">while</span> (${condition}) {`;
        }
    }
    
    function generateComment() {
        const comments = [
            "This bypasses the security protocol",
            "TODO: Make this less detectable",
            "Temporary workaround for firewall",
            "This exploits the zero-day vulnerability",
            "Injection point for payload",
            "Backdoor access point",
            "This will trigger the security system",
            "Need to obfuscate this better"
        ];
        return `<span class="comment">// ${comments[Math.floor(Math.random() * comments.length)]}</span>`;
    }
    
    function generateSystemMessage() {
        const messages = [
            {text: "> WARNING: Security system detected", class: "warning"},
            {text: "> ERROR: Firewall blocked attempt", class: "error"},
            {text: "> SUCCESS: Bypass completed", class: "success"},
            {text: "> ALERT: Admin privileges required", class: "warning"},
            {text: "> STATUS: Encryption cracked", class: "system"},
            {text: "> NOTICE: Covering tracks", class: "system"},
            {text: "> ACCESS: Root granted", class: "success"},
            {text: "> FAILURE: Connection timed out", class: "error"}
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        return `<span class="${msg.class}">${msg.text}</span>`;
    }
    
    function generateTryCatch() {
        return `<span class="keyword">try</span> {
  ${generateFunctionCall()}
} <span class="keyword">catch</span> (err) {
  <span class="function">console</span>.<span class="function">error</span>(err);
}`;
    }
    
    function generateFunctionDefinition() {
        const funcName = functions[Math.floor(Math.random() * functions.length)];
        const params = Math.random() > 0.7 ? 
            `${variables[Math.floor(Math.random() * variables.length)]}` : '';
        
        let body = '';
        const lines = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < lines; i++) {
            body += `  ${generateCodeLine()}\n`;
        }
        
        return `<span class="keyword">function</span> <span class="function">${funcName}</span>(${params}) {
${body}}`;
    }
    
    // Terminal operations
    function addLine(content, delay = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.innerHTML = content;
                terminal.appendChild(line);
                terminal.scrollTop = terminal.scrollHeight;
                resolve();
            }, delay);
        });
    }
    
    function showPrompt() {
        return new Promise(resolve => {
            const line = document.createElement('div');
            line.id = "input-line";
            line.innerHTML = `<span id="prompt">></span> <span id="cursor">_</span>`;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            
            // Resolve after a random delay to simulate "thinking"
            setTimeout(resolve, Math.random() * 1000 + 500);
        });
    }
    
    // Main loop
    async function hackerLoop() {
        // Initial system messages
        await addLine('<span class="system">> INITIALIZING HACKING SEQUENCE...</span>', 100);
        await addLine('<span class="system">> SCANNING NETWORK...</span>', 100);
        await addLine('<span class="system">> LOCATING VULNERABILITIES...</span>', 100);
        await addLine('<span class="success">> ACCESS GRANTED</span>', 500);
        await addLine('', 500);
        
        // Continuous code generation
        while (true) {
            // Add some random code
            const codeLines = Math.floor(Math.random() * 5) + 3;
            for (let i = 0; i < codeLines; i++) {
                await addLine(generateCodeLine(), Math.random() * 200);
            }
            
            // Add some system messages
            if (Math.random() > 0.7) {
                await addLine('', 300);
                await addLine(generateSystemMessage(), 300);
                await addLine('', 300);
            }
            
            // Show prompt
            await showPrompt();
            
            // Simulate user input
            const input = Math.random() > 0.5 ? 
                `run ${functions[Math.floor(Math.random() * functions.length)]}` :
                `exploit ${objects[Math.floor(Math.random() * objects.length)]}`;
            
            await addLine(`<span class="system">> ${input.toUpperCase()}</span>`, 300);
            
            // Add response
            if (Math.random() > 0.3) {
                await addLine(`<span class="success">> COMMAND EXECUTED SUCCESSFULLY</span>`, 300);
            } else {
                await addLine(`<span class="error">> ERROR: ${['ACCESS DENIED', 'INSUFFICIENT PRIVILEGES', 'CONNECTION FAILED'][Math.floor(Math.random() * 3)]}</span>`, 300);
            }
            
            await addLine('', 500);
        }
    }
    
    // Start the hacker loop
    hackerLoop();
});