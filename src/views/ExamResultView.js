export class ExamResultView {
    constructor() {
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.correctCount = document.getElementById('correctCount');
        this.totalQuestions = document.getElementById('totalQuestions');
        this.timeSpent = document.getElementById('timeSpent');
        this.easyBar = document.getElementById('easyBar');
        this.easyPercentage = document.getElementById('easyPercentage');
        this.mediumBar = document.getElementById('mediumBar');
        this.mediumPercentage = document.getElementById('mediumPercentage');
        this.hardBar = document.getElementById('hardBar');
        this.hardPercentage = document.getElementById('hardPercentage');
        this.performanceChart = document.getElementById('performanceChart');
        this.chartLabels = document.getElementById('chartLabels');
        this.backToProfileButton = document.querySelector('.nav-actions .btn-secondary');
        this.returnToDashboardButton = document.querySelector('.action-buttons .btn-secondary');
        this.viewAnalyticsButton = document.querySelector('.action-buttons .btn-primary');
    }
    // Render Methods
    renderResults(result, exam) {
        const score = result.score;
        this.scoreDisplay.textContent = score + '%';

        if (score >= 70) {
            this.resultIcon.textContent = '🎉';
            this.resultTitle.textContent = 'Excellent Work!';
            this.resultTitle.className = 'result-title success';
            this.resultMessage.textContent = 'Outstanding performance! You have demonstrated strong understanding of the material.';
        } else if (score >= 50) {
            this.resultIcon.textContent = '👍';
            this.resultTitle.textContent = 'Good Job!';
            this.resultTitle.className = 'result-title warning';
            this.resultMessage.textContent = 'Well done! With a bit more practice, you can achieve even better results.';
        } else {
            this.resultIcon.textContent = '💪';
            this.resultTitle.textContent = 'Keep Practicing!';
            this.resultTitle.className = 'result-title failure';
            this.resultMessage.textContent = 'Don\'t give up! Review the material and try to understand the concepts better.';
        }

        let correctCount = 0;
        result.answers.forEach((answer) => {
            if (answer && answer.isCorrect) {
                correctCount++;
            }
        });

        this.correctCount.textContent = correctCount;
        this.totalQuestions.textContent = exam.questionCount;
        this.timeSpent.textContent = exam.duration + 'm';
    }

    renderDifficultyBreakdown(difficulties) {
        Object.keys(difficulties).forEach(diff => {
            const percentage = difficulties[diff].total > 0
                ? Math.round((difficulties[diff].correct / difficulties[diff].total) * 100)
                : 0;
            
            const bar = this[diff + 'Bar'];
            const percentageText = this[diff + 'Percentage'];

            if (bar) {
                bar.style.width = percentage + '%';
            }
            if (percentageText) {
                percentageText.textContent = `${difficulties[diff].correct}/${difficulties[diff].total} (${percentage}%)`;
            }
        });
    }

    renderPerformanceChart(difficulties) {
        this.performanceChart.innerHTML = '';
        this.chartLabels.innerHTML = '';

        Object.keys(difficulties).forEach(diff => {
            const percentage = difficulties[diff].total > 0
                ? Math.round((difficulties[diff].correct / difficulties[diff].total) * 100)
                : 0;

            const barColumn = document.createElement('div');
            barColumn.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; flex: 1;';
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.cssText = `height: ${percentage}%; width: 60px; min-height: 20px; transition: height 0.8s ease; position: relative;`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = percentage + '%';
            value.style.cssText = 'position: absolute; top: -30px; left: 50%; transform: translateX(-50%); font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap;';
            
            bar.appendChild(value);
            barColumn.appendChild(bar);
            this.performanceChart.appendChild(barColumn);

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            label.style.cssText = 'text-align: center; font-weight: 600; margin-top: 8px; color: var(--text-secondary);';
            this.chartLabels.appendChild(label);
        });
    }
    
    bindBackToProfile(handler) {
        this.backToProfileButton.addEventListener('click', handler);
        this.returnToDashboardButton.addEventListener('click', handler);
    }
    
    bindViewAnalytics(handler) {
        this.viewAnalyticsButton.addEventListener('click', handler);
    }
}
