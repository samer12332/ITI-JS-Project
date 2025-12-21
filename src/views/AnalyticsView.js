export class AnalyticsView {
    constructor() {
        this.studentName = document.getElementById('studentName');
        this.totalExams = document.getElementById('totalExams');
        this.avgScore = document.getElementById('avgScore');
        this.highestScore = document.getElementById('highestScore');
        this.improvementRate = document.getElementById('improvementRate');
        this.lineChart = document.getElementById('lineChart');
        this.pieChart = document.getElementById('pieChart');
        this.pieTotal = document.getElementById('pieTotal');
        this.easyCount = document.getElementById('easyCount');
        this.mediumCount = document.getElementById('mediumCount');
        this.hardCount = document.getElementById('hardCount');
        this.barChart = document.getElementById('barChart');
        this.backToProfileButton = document.querySelector('.nav-actions .btn-secondary');
    }
    // Render Methods
    renderAnalytics(profile, completedExams, results) {
        this.studentName.textContent = `Analyzing performance for ${profile.username}`;
        
        const totalExams = completedExams.length;
        const avgScore = totalExams > 0
            ? Math.round(completedExams.reduce((sum, exam) => sum + exam.score, 0) / totalExams)
            : 0;
        const highestScore = totalExams > 0
            ? Math.max(...completedExams.map(e => e.score))
            : 0;

        let improvementRate = 0;
        if (completedExams.length >= 2) {
            const firstScore = completedExams[0].score;
            const lastScore = completedExams[completedExams.length - 1].score;
            improvementRate = firstScore > 0 ? Math.round(((lastScore - firstScore) / firstScore) * 100) : 0;
        }

        this.totalExams.textContent = totalExams;
        this.avgScore.textContent = avgScore + '%';
        this.highestScore.textContent = highestScore + '%';
        this.improvementRate.textContent = (improvementRate >= 0 ? '+' : '') + improvementRate + '%';
    }

    renderLineChart(completedExams) {
        this.lineChart.innerHTML = '';
        if (completedExams.length === 0) return;

        completedExams.forEach((exam, idx) => {
            const point = document.createElement('div');
            point.className = 'line-chart-point';
            point.style.height = `${exam.score}%`;
            
            const dot = document.createElement('div');
            dot.className = 'line-point';
            dot.title = `${exam.name}: ${exam.score}%`;
            
            const value = document.createElement('div');
            value.className = 'line-point-value';
            value.textContent = exam.score + '%';
            
            const label = document.createElement('div');
            label.className = 'line-chart-label';
            label.textContent = `Exam ${idx + 1}`;
            
            dot.appendChild(value);
            point.appendChild(dot);
            point.appendChild(label);
            this.lineChart.appendChild(point);
        });
    }

    renderPieChart(difficulties, totalQuestions) {
        this.pieTotal.textContent = totalQuestions;
        this.easyCount.textContent = difficulties.easy;
        this.mediumCount.textContent = difficulties.medium;
        this.hardCount.textContent = difficulties.hard;

        const easyDeg = totalQuestions > 0 ? (difficulties.easy / totalQuestions) * 360 : 0;
        const mediumDeg = totalQuestions > 0 ? easyDeg + ((difficulties.medium / totalQuestions) * 360) : 0;

        this.pieChart.style.setProperty('--easy-deg', easyDeg + 'deg');
        this.pieChart.style.setProperty('--medium-deg', mediumDeg + 'deg');
    }
    bindBackToProfile(handler) {
        this.backToProfileButton.addEventListener('click', handler);
    }
}
