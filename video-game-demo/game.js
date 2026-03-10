/**
 * 互动影游 - 分支剧情游戏引擎
 * 支持视频节点、分支选择、多结局
 */

class InteractiveMovieGame {
    constructor() {
        this.video = document.getElementById('mainVideo');
        this.choiceOverlay = document.getElementById('choiceOverlay');
        this.endingOverlay = document.getElementById('endingOverlay');
        this.choicesContainer = document.getElementById('choicesContainer');
        this.choiceQuestion = document.getElementById('choiceQuestion');
        this.choiceTimer = document.getElementById('choiceTimer');
        this.timerText = document.getElementById('timerText');
        this.progressFill = document.getElementById('progressFill');
        this.nodePath = document.getElementById('nodePath');
        
        // 游戏状态
        this.currentNodeId = null;
        this.nodeHistory = [];
        this.choiceHistory = [];
        this.startTime = null;
        this.timerInterval = null;
        this.choiceTimeout = null;
        this.defaultChoiceTime = 10; // 默认选择时间（秒）
        this.hasShownChoice = false; // 是否已显示选择界面
        this.isChoosing = false; // 是否正在选择中
        
        // 故事数据（默认示例）
        this.storyData = this.getDefaultStory();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStartScreen();
    }

    // 默认示例故事
    getDefaultStory() {
        return {
            nodes: {
                "start": {
                    id: "start",
                    name: "序章：醒来",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    duration: 10, // 播放10秒后显示选择
                    question: "你发现自己在一个陌生的房间，你会：",
                    choices: [
                        { text: "检查口袋里的物品", next: "check_pocket", key: "A" },
                        { text: "打开房门出去", next: "open_door", key: "B" },
                        { text: "大声呼救", next: "call_help", key: "C" }
                    ],
                    timeoutChoice: "check_pocket" // 超时时默认选择
                },
                "check_pocket": {
                    id: "check_pocket",
                    name: "口袋的秘密",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    duration: 8,
                    question: "你发现了一把钥匙和一张纸条，上面写着'不要相信任何人'。你会：",
                    choices: [
                        { text: "相信纸条，独自探索", next: "explore_alone", key: "A" },
                        { text: "寻找其他人求助", next: "find_others", key: "B" }
                    ],
                    timeoutChoice: "explore_alone"
                },
                "open_door": {
                    id: "open_door",
                    name: "走廊惊魂",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    duration: 8,
                    question: "走廊尽头有两条路，你听到左边有声音，右边一片寂静。你会：",
                    choices: [
                        { text: "走向左边（有声音）", next: "follow_sound", key: "A" },
                        { text: "走向右边（安静）", next: "quiet_path", key: "B" }
                    ],
                    timeoutChoice: "quiet_path"
                },
                "call_help": {
                    id: "call_help",
                    name: "呼救的后果",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    duration: 6,
                    question: "你的呼救引来了注意，但不知道来的是敌是友。你会：",
                    choices: [
                        { text: "躲藏起来", next: "hide_ending", key: "A" },
                        { text: "主动现身", next: "reveal_ending", key: "B" }
                    ],
                    timeoutChoice: "hide_ending"
                },
                "explore_alone": {
                    id: "explore_alone",
                    name: "独自前行",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                    duration: 8,
                    question: "你发现了一个秘密通道，但看起来很危险。你会：",
                    choices: [
                        { text: "冒险进入", next: "secret_ending_good", key: "A" },
                        { text: "寻找其他出路", next: "trapped_ending", key: "B" }
                    ],
                    timeoutChoice: "trapped_ending"
                },
                "find_others": {
                    id: "find_others",
                    name: "遇见陌生人",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                    duration: 8,
                    question: "你遇到了一个神秘人，他声称可以帮你逃离。你会：",
                    choices: [
                        { text: "相信他", next: "betrayed_ending", key: "A" },
                        { text: "保持警惕", next: "escape_ending", key: "B" }
                    ],
                    timeoutChoice: "escape_ending"
                },
                "follow_sound": {
                    id: "follow_sound",
                    name: "声音的来源",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                    duration: 6,
                    question: "声音来自一个被困的人，但救他可能会暴露自己。你会：",
                    choices: [
                        { text: "冒险救人", next: "hero_ending", key: "A" },
                        { text: "继续独自前进", next: "survivor_ending", key: "B" }
                    ],
                    timeoutChoice: "survivor_ending"
                },
                "quiet_path": {
                    id: "quiet_path",
                    name: "寂静之路",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                    duration: 8,
                    question: "你发现了一个出口，但门被锁住了。你会：",
                    choices: [
                        { text: "用钥匙尝试开锁", next: "freedom_ending", key: "A" },
                        { text: "寻找其他出口", next: "lost_ending", key: "B" }
                    ],
                    timeoutChoice: "lost_ending"
                },
                // 结局节点
                "hide_ending": {
                    id: "hide_ending",
                    name: "隐藏结局：谨慎的幸存者",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                    isEnding: true,
                    endingTitle: "隐藏结局：谨慎的幸存者",
                    endingDesc: "你选择躲藏起来，成功避开了危险。虽然安全了，但你永远不知道外面发生了什么。有时候，不知道真相也是一种幸福。"
                },
                "reveal_ending": {
                    id: "reveal_ending",
                    name: "悲剧结局：信任的代价",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                    isEnding: true,
                    endingTitle: "悲剧结局：信任的代价",
                    endingDesc: "你主动现身，却发现来者是敌人。你的善良成为了你的弱点。在这个世界，信任是需要付出代价的。"
                },
                "secret_ending_good": {
                    id: "secret_ending_good",
                    name: "完美结局：真相大白",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
                    isEnding: true,
                    endingTitle: "完美结局：真相大白",
                    endingDesc: "你发现了这个地方的秘密，成功逃脱并揭露了真相。你的勇气和智慧拯救了所有人。这是最好的结局！"
                },
                "trapped_ending": {
                    id: "trapped_ending",
                    name: "困境结局：循环往复",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                    isEnding: true,
                    endingTitle: "困境结局：循环往复",
                    endingDesc: "你一直在寻找其他出路，却发现自己回到了原点。有时候，不做出选择也是一种选择，但代价是永远困在这里。"
                },
                "betrayed_ending": {
                    id: "betrayed_ending",
                    name: "背叛结局：轻信他人",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                    isEnding: true,
                    endingTitle: "背叛结局：轻信他人",
                    endingDesc: "你相信了那个神秘人，但他背叛了你。纸条上的警告是对的——不要相信任何人。"
                },
                "escape_ending": {
                    id: "escape_ending",
                    name: "生存结局：独善其身",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    isEnding: true,
                    endingTitle: "生存结局：独善其身",
                    endingDesc: "你保持警惕，成功逃离了这个地方。虽然你没有救其他人，但你活了下来。在这个世界，活着就是胜利。"
                },
                "hero_ending": {
                    id: "hero_ending",
                    name: "英雄结局：舍己为人",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    isEnding: true,
                    endingTitle: "英雄结局：舍己为人",
                    endingDesc: "你冒险救了那个被困的人，虽然暴露了自己，但你们一起找到了出路。善良终将得到回报。"
                },
                "survivor_ending": {
                    id: "survivor_ending",
                    name: "孤独结局：独自前行",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    isEnding: true,
                    endingTitle: "孤独结局：独自前行",
                    endingDesc: "你选择了独自前进，成功逃脱了。但那个被困的人永远留在了那里。生存和道德，你选择了前者。"
                },
                "freedom_ending": {
                    id: "freedom_ending",
                    name: "自由结局：重获新生",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    isEnding: true,
                    endingTitle: "自由结局：重获新生",
                    endingDesc: "钥匙打开了门，你终于重获自由。阳光照在你脸上，你发誓再也不会回到那个可怕的地方。"
                },
                "lost_ending": {
                    id: "lost_ending",
                    name: "迷失结局：无尽迷宫",
                    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                    isEnding: true,
                    endingTitle: "迷失结局：无尽迷宫",
                    endingDesc: "你一直在寻找其他出口，却迷失在这个巨大的迷宫中。有时候，最简单的解决方案就是正确的方案。"
                }
            },
            startNode: "start"
        };
    }

    setupEventListeners() {
        // 开始按钮
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        
        // 跳过按钮
        document.getElementById('skipBtn').addEventListener('click', () => this.skipToChoice());
        
        // 视频事件
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.video.addEventListener('ended', () => this.onVideoEnded());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // 上传配置
        document.getElementById('videoUpload').addEventListener('change', (e) => this.loadStoryConfig(e));
    }

    start() {
        this.startTime = Date.now();
        this.nodeHistory = [];
        this.choiceHistory = [];
        this.loadNode(this.storyData.startNode);
    }

    restart() {
        this.endingOverlay.classList.remove('active');
        this.choiceOverlay.classList.remove('active');
        this.clearChoiceTimer();
        this.video.pause();
        this.video.currentTime = 0;
        this.video.src = '';
        this.hasShownChoice = false;
        this.isChoosing = false;
        this.currentNodeId = null;
        setTimeout(() => this.start(), 100);
    }

    loadNode(nodeId) {
        const node = this.storyData.nodes[nodeId];
        if (!node) {
            console.error('节点不存在:', nodeId);
            return;
        }

        // 防止重复加载同一节点
        if (this.currentNodeId === nodeId && this.nodeHistory.length > 0) {
            console.log('节点已在当前，跳过加载:', nodeId);
            return;
        }

        this.currentNodeId = nodeId;
        this.nodeHistory.push(node);
        this.updateNodePath();
        
        // 重置选择显示标志
        this.hasShownChoice = false;
        
        // 清除任何正在运行的计时器
        this.clearChoiceTimer();

        // 隐藏选择界面
        this.choiceOverlay.classList.remove('active');
        this.endingOverlay.classList.remove('active');

        // 如果是结局节点
        if (node.isEnding) {
            this.playEnding(node);
            return;
        }

        // 加载视频
        this.loadVideo(node.video);
    }

    loadVideo(src) {
        this.video.src = src;
        this.video.load();
        this.video.play().catch(err => {
            console.error('视频播放失败:', err);
            // 如果在线视频失败，显示选择界面
            setTimeout(() => this.showChoices(), 1000);
        });
    }

    onTimeUpdate() {
        const node = this.storyData.nodes[this.currentNodeId];
        if (!node || node.isEnding) return;
        
        // 如果已经在显示选择界面，不再处理
        if (this.choiceOverlay.classList.contains('active')) return;

        // 更新进度条
        const progress = (this.video.currentTime / this.video.duration) * 100;
        this.progressFill.style.width = `${progress}%`;

        // 到达指定时间显示选择（只触发一次）
        if (node.duration && this.video.currentTime >= node.duration && !this.hasShownChoice) {
            this.hasShownChoice = true;
            this.video.pause();
            this.showChoices();
        }
    }

    onVideoEnded() {
        const node = this.storyData.nodes[this.currentNodeId];
        if (!node) return;
        
        // 如果已经在显示选择界面，不再处理
        if (this.choiceOverlay.classList.contains('active')) return;
        if (this.endingOverlay.classList.contains('active')) return;

        if (node.isEnding) {
            // 结局视频播放完，显示结局画面
            setTimeout(() => this.showEndingScreen(node), 500);
        } else if (!this.hasShownChoice) {
            // 显示选择（只触发一次）
            this.hasShownChoice = true;
            this.showChoices();
        }
    }

    showChoices() {
        const node = this.storyData.nodes[this.currentNodeId];
        if (!node || node.isEnding) return;

        this.choiceQuestion.textContent = node.question || '你会怎么选择？';
        this.choicesContainer.innerHTML = '';

        // 创建选择按钮
        node.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.style.setProperty('--index', index);
            btn.innerHTML = `
                <span class="key">${choice.key || String.fromCharCode(65 + index)}</span>
                <span>${choice.text}</span>
            `;
            btn.addEventListener('click', () => this.makeChoice(choice));
            this.choicesContainer.appendChild(btn);
        });

        this.choiceOverlay.classList.add('active');

        // 启动倒计时
        this.startChoiceTimer(node.timeout || this.defaultChoiceTime, node.timeoutChoice);
    }

    startChoiceTimer(seconds, defaultChoice) {
        let remaining = seconds;
        this.timerText.textContent = remaining;

        this.timerInterval = setInterval(() => {
            remaining--;
            this.timerText.textContent = remaining;
            
            // 更新圆形进度条
            const progress = ((seconds - remaining) / seconds) * 100;
            this.choiceTimer.style.setProperty('--progress', `${progress}%`);

            if (remaining <= 0) {
                this.clearChoiceTimer();
                // 自动选择默认选项
                if (defaultChoice) {
                    this.loadNode(defaultChoice);
                }
            }
        }, 1000);
    }

    clearChoiceTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    makeChoice(choice) {
        // 防止重复选择
        if (this.isChoosing) return;
        this.isChoosing = true;
        
        this.clearChoiceTimer();
        this.choiceHistory.push({
            node: this.currentNodeId,
            choice: choice.text,
            timestamp: Date.now()
        });
        
        // 延迟加载下一节点，防止快速点击
        setTimeout(() => {
            this.isChoosing = false;
            this.loadNode(choice.next);
        }, 100);
    }

    skipToChoice() {
        const node = this.storyData.nodes[this.currentNodeId];
        if (!node || node.isEnding) return;
        
        this.video.pause();
        this.showChoices();
    }

    playEnding(node) {
        this.loadVideo(node.video);
    }

    showEndingScreen(node) {
        document.getElementById('endingTitle').textContent = node.endingTitle;
        document.getElementById('endingDesc').textContent = node.endingDesc;
        document.getElementById('statNodes').textContent = this.nodeHistory.length;
        document.getElementById('statChoices').textContent = this.choiceHistory.length;
        document.getElementById('statTime').textContent = this.formatTime(
            Math.floor((Date.now() - this.startTime) / 1000)
        );
        
        this.endingOverlay.classList.add('active');
    }

    onKeyDown(e) {
        if (!this.choiceOverlay.classList.contains('active')) return;

        const node = this.storyData.nodes[this.currentNodeId];
        if (!node || !node.choices) return;

        // 数字键 1-9 或字母键 A-Z
        const key = e.key.toUpperCase();
        const choice = node.choices.find(c => c.key === key);
        
        if (choice) {
            this.makeChoice(choice);
        }
    }

    updateNodePath() {
        if (this.nodeHistory.length === 0) {
            this.nodePath.innerHTML = '<span style="color: #666">等待开始...</span>';
            return;
        }

        this.nodePath.innerHTML = this.nodeHistory.map((node, index) => {
            const isLast = index === this.nodeHistory.length - 1;
            return `
                ${index > 0 ? '<span class="node-arrow">→</span>' : ''}
                <span class="node-item ${isLast ? 'current' : ''}">${node.name}</span>
            `;
        }).join('');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showStartScreen() {
        this.nodePath.innerHTML = '<span style="color: #666">点击"开始游戏"体验互动剧情</span>';
    }

    // 加载自定义故事配置
    loadStoryConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (config.nodes && config.startNode) {
                    this.storyData = config;
                    alert('故事配置加载成功！点击开始游戏。');
                    this.restart();
                } else {
                    alert('配置文件格式错误！');
                }
            } catch (err) {
                alert('配置文件解析失败: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
}

// 启动游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new InteractiveMovieGame();
});
