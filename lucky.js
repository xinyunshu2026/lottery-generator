class LotteryGenerator {
    constructor() {
        this.currentGame = 'ssq';
        this.history = JSON.parse(localStorage.getItem('lotteryHistory')) || [];
        this.drawHistory = JSON.parse(localStorage.getItem('drawHistory')) || {};
        this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        this.audioContext = null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateGameTitle();
        this.updateHistory();
        this.initTheme();
        this.initAudio();
        this.initShare();
    }
    
    initAudio() {
        // 尝试初始化音频上下文
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playBallSound(index) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const frequency = 400 + (index * 50);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    bindEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playClickSound();
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const tabName = e.target.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName).classList.add('active');
                
                // 如果切换到分析标签，更新分析数据
                if (tabName === 'analysis') {
                    this.updateAnalysis();
                }
            });
        });
        
        // 游戏选择按钮
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playClickSound();
                document.querySelectorAll('.game-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentGame = e.target.dataset.game;
                this.updateGameTitle();
                this.clearBalls();
            });
        });
        
        // 生成按钮
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.playClickSound();
            this.generateNumbers();
        });
        
        // 导出按钮
        document.getElementById('export-btn').addEventListener('click', () => {
            this.playClickSound();
            this.exportNumbers();
        });
        
        // 清空历史按钮
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.playClickSound();
            this.clearHistory();
        });
        
        // 主题切换按钮
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.playClickSound();
            this.toggleTheme();
        });
        
        // 获取开奖号按钮
        document.getElementById('fetch-draw-btn').addEventListener('click', () => {
            this.playClickSound();
            this.fetchDrawNumbers();
        });
        
        // 复制分享链接按钮
        document.getElementById('copy-link-btn').addEventListener('click', () => {
            this.playClickSound();
            this.copyShareLink();
        });
    }
    
    fetchDrawNumbers() {
        const count = parseInt(document.getElementById('draw-count').value);
        const game = this.currentGame;
        
        // 模拟获取开奖号数据
        // 实际项目中可以通过API获取真实数据
        const drawNumbers = this.generateMockDrawNumbers(game, count);
        
        this.drawHistory[game] = drawNumbers;
        localStorage.setItem('drawHistory', JSON.stringify(this.drawHistory));
        this.updateDrawHistory();
        
        alert(`成功获取最近${count}期${game === 'ssq' ? '双色球' : '大乐透'}开奖号`);
    }
    
    generateMockDrawNumbers(game, count) {
        const drawNumbers = [];
        
        for (let i = 0; i < count; i++) {
            let numbers = [];
            
            if (game === 'ssq') {
                // 双色球：6个红球(1-33) + 1个蓝球(1-16)
                const redBalls = this.generateUniqueNumbers(1, 33, 6);
                const blueBall = this.generateUniqueNumbers(1, 16, 1);
                numbers = [...redBalls, ...blueBall];
            } else {
                // 大乐透：5个红球(1-35) + 2个蓝球(1-12)
                const redBalls = this.generateUniqueNumbers(1, 35, 5);
                const blueBalls = this.generateUniqueNumbers(1, 12, 2);
                numbers = [...redBalls, ...blueBalls];
            }
            
            drawNumbers.push({
                period: `2026${String(i + 1).padStart(3, '0')}`,
                numbers: numbers,
                date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
            });
        }
        
        return drawNumbers;
    }
    
    updateDrawHistory() {
        const drawHistoryList = document.getElementById('draw-history-list');
        drawHistoryList.innerHTML = '';
        
        const game = this.currentGame;
        const drawNumbers = this.drawHistory[game] || [];
        
        drawNumbers.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const periodSpan = document.createElement('span');
            periodSpan.className = 'time';
            periodSpan.textContent = `${item.period}期 (${item.date})`;
            historyItem.appendChild(periodSpan);
            
            const numbersDiv = document.createElement('span');
            numbersDiv.className = 'numbers';
            
            item.numbers.forEach((num, index) => {
                const numberSpan = document.createElement('span');
                numberSpan.className = `number ${this.getBallType(game, index)}`;
                numberSpan.textContent = num;
                numbersDiv.appendChild(numberSpan);
            });
            
            historyItem.appendChild(numbersDiv);
            drawHistoryList.appendChild(historyItem);
        });
    }
    
    updateGameTitle() {
        const title = this.currentGame === 'ssq' ? '双色球' : '大乐透';
        document.getElementById('game-title').textContent = title;
    }
    
    clearBalls() {
        document.getElementById('balls-container').innerHTML = '';
    }
    
    generateNumbers() {
        const ticketCount = parseInt(document.getElementById('ticket-count').value);
        this.clearBalls();
        
        for (let i = 0; i < ticketCount; i++) {
            setTimeout(() => {
                this.generateSingleTicket();
            }, i * 2000);
        }
    }
    
    generateSingleTicket() {
        let numbers = [];
        let balls = [];
        
        if (this.currentGame === 'ssq') {
            // 双色球：6个红球(1-33) + 1个蓝球(1-16)
            const redBalls = this.generateUniqueNumbers(1, 33, 6);
            const blueBall = this.generateUniqueNumbers(1, 16, 1);
            numbers = [...redBalls, ...blueBall];
            
            redBalls.forEach(num => {
                balls.push({ value: num, type: 'red' });
            });
            blueBall.forEach(num => {
                balls.push({ value: num, type: 'blue' });
            });
        } else {
            // 大乐透：5个红球(1-35) + 2个蓝球(1-12)
            const redBalls = this.generateUniqueNumbers(1, 35, 5);
            const blueBalls = this.generateUniqueNumbers(1, 12, 2);
            numbers = [...redBalls, ...blueBalls];
            
            redBalls.forEach(num => {
                balls.push({ value: num, type: 'red' });
            });
            blueBalls.forEach(num => {
                balls.push({ value: num, type: 'green' });
            });
        }
        
        this.displayBalls(balls);
        this.saveToHistory(numbers);
    }
    
    generateUniqueNumbers(min, max, count) {
        const numbers = new Set();
        while (numbers.size < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(num);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }
    
    displayBalls(balls) {
        const container = document.getElementById('balls-container');
        
        // 添加分隔线
        if (container.children.length > 0) {
            const divider = document.createElement('div');
            divider.style.width = '100%';
            divider.style.height = '20px';
            container.appendChild(divider);
        }
        
        balls.forEach((ball, index) => {
            setTimeout(() => {
                this.playBallSound(index);
                const ballElement = document.createElement('div');
                ballElement.className = `ball ${ball.type}`;
                ballElement.textContent = ball.value;
                container.appendChild(ballElement);
            }, index * 300);
        });
    }
    
    saveToHistory(numbers) {
        const gameName = this.currentGame === 'ssq' ? '双色球' : '大乐透';
        const timestamp = new Date().toLocaleString();
        
        const historyItem = {
            game: gameName,
            numbers: numbers,
            time: timestamp
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        localStorage.setItem('lotteryHistory', JSON.stringify(this.history));
        this.updateHistory();
    }
    
    updateHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = item.time;
            historyItem.appendChild(timeSpan);
            
            const gameSpan = document.createElement('span');
            gameSpan.className = 'game';
            gameSpan.textContent = item.game + '：';
            historyItem.appendChild(gameSpan);
            
            const numbersDiv = document.createElement('span');
            numbersDiv.className = 'numbers';
            
            item.numbers.forEach((num, index) => {
                const numberSpan = document.createElement('span');
                numberSpan.className = `number ${this.getBallType(item.game, index)}`;
                numberSpan.textContent = num;
                numbersDiv.appendChild(numberSpan);
            });
            
            historyItem.appendChild(numbersDiv);
            historyList.appendChild(historyItem);
        });
    }
    
    getBallType(game, index) {
        if (game === '双色球') {
            return index < 6 ? 'red' : 'blue';
        } else {
            return index < 5 ? 'red' : 'green';
        }
    }
    
    exportNumbers() {
        if (this.history.length === 0) {
            alert('暂无历史记录可导出');
            return;
        }
        
        let exportContent = '幸运瑶 - 彩票摇号记录\n';
        exportContent += '='.repeat(50) + '\n';
        
        this.history.forEach((item, index) => {
            exportContent += `第${index + 1}条记录\n`;
            exportContent += `时间：${item.time}\n`;
            exportContent += `类型：${item.game}\n`;
            exportContent += `号码：`;
            
            item.numbers.forEach((num, i) => {
                if (item.game === '双色球') {
                    exportContent += i < 6 ? `红${num} ` : `蓝${num}`;
                } else {
                    exportContent += i < 5 ? `红${num} ` : `绿${num} `;
                }
            });
            
            exportContent += '\n' + '-'.repeat(50) + '\n';
        });
        
        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `幸运瑶_摇号记录_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearHistory() {
        if (confirm('确定要清空所有摇号历史记录吗？')) {
            this.history = [];
            localStorage.removeItem('lotteryHistory');
            this.updateHistory();
            alert('历史记录已清空');
        }
    }
    
    initTheme() {
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.querySelector('.theme-toggle i').className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('.theme-toggle i').className = 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('darkTheme', this.isDarkTheme.toString());
        this.initTheme();
    }
    
    updateAnalysis() {
        const game = this.currentGame;
        const drawNumbers = this.drawHistory[game] || [];
        
        if (drawNumbers.length === 0) {
            document.getElementById('frequency-analysis').innerHTML = '<p>请先获取开奖号数据</p>';
            document.getElementById('hot-cold-analysis').innerHTML = '<p>请先获取开奖号数据</p>';
            document.getElementById('odd-even-analysis').innerHTML = '<p>请先获取开奖号数据</p>';
            return;
        }
        
        this.updateFrequencyAnalysis(game, drawNumbers);
        this.updateHotColdAnalysis(game, drawNumbers);
        this.updateOddEvenAnalysis(game, drawNumbers);
    }
    
    updateFrequencyAnalysis(game, drawNumbers) {
        const frequency = {};
        const redRange = game === 'ssq' ? 33 : 35;
        const blueRange = game === 'ssq' ? 16 : 12;
        
        // 初始化频率对象
        for (let i = 1; i <= redRange; i++) {
            frequency[i] = 0;
        }
        
        // 统计红球频率
        drawNumbers.forEach(item => {
            const redCount = game === 'ssq' ? 6 : 5;
            for (let i = 0; i < redCount; i++) {
                frequency[item.numbers[i]]++;
            }
        });
        
        // 生成频率分析HTML
        let html = '<div class="frequency-list">';
        Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([num, count]) => {
                html += `<div class="frequency-item">
                    <span class="number red">${num}</span>
                    <span class="frequency-count">出现 ${count} 次</span>
                </div>`;
            });
        html += '</div>';
        
        document.getElementById('frequency-analysis').innerHTML = html;
    }
    
    updateHotColdAnalysis(game, drawNumbers) {
        const frequency = {};
        const redRange = game === 'ssq' ? 33 : 35;
        
        // 初始化频率对象
        for (let i = 1; i <= redRange; i++) {
            frequency[i] = 0;
        }
        
        // 统计红球频率
        drawNumbers.forEach(item => {
            const redCount = game === 'ssq' ? 6 : 5;
            for (let i = 0; i < redCount; i++) {
                frequency[item.numbers[i]]++;
            }
        });
        
        // 排序频率
        const sortedNumbers = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .map(([num]) => parseInt(num));
        
        const hotNumbers = sortedNumbers.slice(0, 5);
        const coldNumbers = sortedNumbers.slice(-5).reverse();
        
        let html = '<div class="hot-cold-list">';
        html += '<div class="hot-numbers">';
        html += '<h4>热门号码：</h4>';
        html += '<div class="number-list">';
        hotNumbers.forEach(num => {
            html += `<span class="number red">${num}</span>`;
        });
        html += '</div></div>';
        
        html += '<div class="cold-numbers">';
        html += '<h4>冷门号码：</h4>';
        html += '<div class="number-list">';
        coldNumbers.forEach(num => {
            html += `<span class="number red">${num}</span>`;
        });
        html += '</div></div>';
        
        html += '</div>';
        
        document.getElementById('hot-cold-analysis').innerHTML = html;
    }
    
    updateOddEvenAnalysis(game, drawNumbers) {
        let totalOdd = 0;
        let totalEven = 0;
        
        drawNumbers.forEach(item => {
            const redCount = game === 'ssq' ? 6 : 5;
            for (let i = 0; i < redCount; i++) {
                if (item.numbers[i] % 2 === 1) {
                    totalOdd++;
                } else {
                    totalEven++;
                }
            }
        });
        
        const total = totalOdd + totalEven;
        const oddRatio = (totalOdd / total * 100).toFixed(1);
        const evenRatio = (totalEven / total * 100).toFixed(1);
        
        let html = `<div class="odd-even-stats">
            <div class="stat-item">
                <span class="stat-label">奇数：</span>
                <span class="stat-value">${totalOdd} 个 (${oddRatio}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">偶数：</span>
                <span class="stat-value">${totalEven} 个 (${evenRatio}%)</span>
            </div>
        </div>`;
        
        document.getElementById('odd-even-analysis').innerHTML = html;
    }
    
    initShare() {
        // 生成分享链接
        const shareLink = window.location.href;
        document.getElementById('share-link').value = shareLink;
        
        // 生成二维码
        this.generateQRCode(shareLink);
    }
    
    generateQRCode(url) {
        // 使用简单的方法生成二维码
        // 实际项目中可以使用专门的二维码生成库
        const qrCodeContainer = document.getElementById('qrcode-container');
        qrCodeContainer.innerHTML = `<div class="qrcode-placeholder">
            <p>扫描二维码访问</p>
            <div class="qrcode-text">${url}</div>
        </div>`;
    }
    
    copyShareLink() {
        const shareLink = document.getElementById('share-link');
        shareLink.select();
        document.execCommand('copy');
        alert('分享链接已复制到剪贴板');
    }
}

// 初始化应用
new LotteryGenerator();