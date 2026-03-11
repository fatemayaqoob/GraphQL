// charts.js - SVG chart generation

// Generate audit activity bar chart
function generateAuditBarChart(audits) {
    const svg = document.getElementById('audit-chart');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (audits.length === 0) {
        const noData = createSVGElement('text', {
            x: '50%',
            y: '50%',
            'text-anchor': 'middle',
            fill: '#999',
            'font-size': '18'
        });
        noData.textContent = 'No audit data available';
        svg.appendChild(noData);
        return;
    }
    
    // Group audits by month
    const monthlyData = {};
    audits.forEach(audit => {
        const date = new Date(audit.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { up: 0, down: 0, date: date };
        }
        
        if (audit.type === 'up') {
            monthlyData[monthYear].up += audit.amount;
        } else if (audit.type === 'down') {
            monthlyData[monthYear].down += audit.amount;
        }
    });
    
    // Convert to array and sort by date
    const months = Object.keys(monthlyData).sort().map(key => ({
        month: key,
        up: monthlyData[key].up,
        down: monthlyData[key].down,
        date: monthlyData[key].date
    }));
    
    // Limit to last 6 months for readability
    const recentMonths = months.slice(-6);
    
    const width = 800;
    const height = 400;
    const padding = 80;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Find max value across all months
    const maxValue = Math.max(
        ...recentMonths.map(m => Math.max(m.up, m.down)),
        1 // Minimum value of 1 to avoid division by zero
    );
    
    const barWidth = Math.min(40, graphWidth / (recentMonths.length * 2.5));
    const groupWidth = graphWidth / recentMonths.length;
    
    // Draw axes
    const yAxis = createSVGElement('line', {
        x1: padding,
        y1: padding,
        x2: padding,
        y2: height - padding,
        stroke: '#9575CD',
        'stroke-width': '2'
    });
    svg.appendChild(yAxis);
    
    const xAxis = createSVGElement('line', {
        x1: padding,
        y1: height - padding,
        x2: width - padding,
        y2: height - padding,
        stroke: '#9575CD',
        'stroke-width': '2'
    });
    svg.appendChild(xAxis);
    
    // Draw grid lines and Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * i;
        const y = height - padding - (graphHeight / 5) * i;
        
        const gridLine = createSVGElement('line', {
            x1: padding,
            y1: y,
            x2: width - padding,
            y2: y,
            stroke: '#E8DFF5',
            'stroke-width': '1',
            'stroke-dasharray': '4'
        });
        svg.appendChild(gridLine);
        
        const label = createSVGElement('text', {
            x: padding - 10,
            y: y + 5,
            'text-anchor': 'end',
            fill: '#9575CD',
            'font-size': '12'
        });
        label.textContent = formatXP(value);
        svg.appendChild(label);
    }
    
    
    // Create gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const gradientUp = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradientUp.setAttribute('id', 'gradientUp');
    gradientUp.setAttribute('x1', '0%');
    gradientUp.setAttribute('y1', '0%');
    gradientUp.setAttribute('x2', '0%');
    gradientUp.setAttribute('y2', '100%');
    const stopUp1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopUp1.setAttribute('offset', '0%');
    stopUp1.setAttribute('style', 'stop-color:#FFB6D9;stop-opacity:1');
    const stopUp2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopUp2.setAttribute('offset', '100%');
    stopUp2.setAttribute('style', 'stop-color:#E1BEE7;stop-opacity:1');
    gradientUp.appendChild(stopUp1);
    gradientUp.appendChild(stopUp2);
    defs.appendChild(gradientUp);
    
    
    const gradientDown = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradientDown.setAttribute('id', 'gradientDown');
    gradientDown.setAttribute('x1', '0%');
    gradientDown.setAttribute('y1', '0%');
    gradientDown.setAttribute('x2', '0%');
    gradientDown.setAttribute('y2', '100%');
    const stopDown1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopDown1.setAttribute('offset', '0%');
    stopDown1.setAttribute('style', 'stop-color:#B3E5FC;stop-opacity:1');
    const stopDown2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stopDown2.setAttribute('offset', '100%');
    stopDown2.setAttribute('style', 'stop-color:#E1BEE7;stop-opacity:1');
    gradientDown.appendChild(stopDown1);
    gradientDown.appendChild(stopDown2);
    defs.appendChild(gradientDown);
    
    svg.appendChild(defs);
    
    // Draw bars for each month
    recentMonths.forEach((monthData, index) => {
        const groupX = padding + (index * groupWidth);
        const centerX = groupX + groupWidth / 2;
        
        // Draw "up" bar (Audits Given)
        const upBarHeight = (monthData.up / maxValue) * graphHeight;
        const upBarX = centerX - barWidth - 5;
        const upBarY = height - padding - upBarHeight;
        
        if (upBarHeight > 0) {
            const upBar = createSVGElement('rect', {
                x: upBarX,
                y: upBarY,
                width: barWidth,
                height: upBarHeight,
                fill: 'url(#gradientUp)',
                rx: '4'
            });
            svg.appendChild(upBar);
        }
        
        // Draw "down" bar (Audits Received)
        const downBarHeight = (monthData.down / maxValue) * graphHeight;
        const downBarX = centerX + 5;
        const downBarY = height - padding - downBarHeight;
        
        if (downBarHeight > 0) {
            const downBar = createSVGElement('rect', {
                x: downBarX,
                y: downBarY,
                width: barWidth,
                height: downBarHeight,
                fill: 'url(#gradientDown)',
                rx: '4'
            });
            svg.appendChild(downBar);
        }
        
        // Month label
        const monthLabel = createSVGElement('text', {
            x: centerX,
            y: height - padding + 20,
            'text-anchor': 'middle',
            fill: '#9575CD',
            'font-size': '11',
            'font-weight': '500'
        });
        const date = monthData.date;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        monthLabel.textContent = `${monthName} '${year}`;
        svg.appendChild(monthLabel);
    });
    
    // Chart title
    const title = createSVGElement('text', {
        x: width / 2,
        y: 30,
        'text-anchor': 'middle',
        fill: '#6B4D82',
        'font-size': '18',
        'font-weight': '600'
    });
    title.textContent = 'Audit Activity Over Time';
    svg.appendChild(title);
    
    // Legend
    const legendY = 50;
    
    const upLegendRect = createSVGElement('rect', {
        x: width / 2 - 100,
        y: legendY,
        width: 20,
        height: 12,
        fill: 'url(#gradientUp)',
        rx: '3'
    });
    svg.appendChild(upLegendRect);
    
    const upLegendText = createSVGElement('text', {
        x: width / 2 - 75,
        y: legendY + 10,
        fill: '#6B4D82',
        'font-size': '12'
    });
    upLegendText.textContent = 'Given';
    svg.appendChild(upLegendText);
    
    const downLegendRect = createSVGElement('rect', {
        x: width / 2 + 10,
        y: legendY,
        width: 20,
        height: 12,
        fill: 'url(#gradientDown)',
        rx: '3'
    });
    svg.appendChild(downLegendRect);
    
    const downLegendText = createSVGElement('text', {
        x: width / 2 + 35,
        y: legendY + 10,
        fill: '#6B4D82',
        'font-size': '12'
    });
    downLegendText.textContent = 'Received';
    svg.appendChild(downLegendText);
}

// Generate XP progress line chart
function generateXPLineChart(transactions) {
    const svg = document.getElementById('xp-chart');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    if (transactions.length === 0) {
        const text = createSVGElement('text', {
            x: '400',
            y: '200',
            'text-anchor': 'middle',
            fill: '#666'
        });
        text.textContent = 'No XP data available';
        svg.appendChild(text);
        return;
    }
    
    const width = 800;
    const height = 400;
    const padding = 60;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Calculate cumulative XP
    let cumulative = 0;
    const dataPoints = transactions.map(t => {
        cumulative += t.amount;
        return {
            date: new Date(t.createdAt),
            xp: cumulative,
            path: t.path
        };
    });
    
    const maxXP = Math.max(...dataPoints.map(d => d.xp));
    const minDate = dataPoints[0].date.getTime();
    const maxDate = dataPoints[dataPoints.length - 1].date.getTime();
    
    // Draw axes
    const yAxis = createSVGElement('line', {
        x1: padding,
        y1: padding,
        x2: padding,
        y2: height - padding,
        stroke: '#333',
        'stroke-width': '2'
    });
    svg.appendChild(yAxis);
    
    const xAxis = createSVGElement('line', {
        x1: padding,
        y1: height - padding,
        x2: width - padding,
        y2: height - padding,
        stroke: '#333',
        'stroke-width': '2'
    });
    svg.appendChild(xAxis);
    
    // Draw grid lines and Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const y = padding + (graphHeight / 5) * i;
        const xpValue = maxXP * (1 - i / 5);
        
        const gridLine = createSVGElement('line', {
            x1: padding,
            y1: y,
            x2: width - padding,
            y2: y,
            stroke: '#e0e0e0',
            'stroke-width': '1'
        });
        svg.appendChild(gridLine);
        
        const label = createSVGElement('text', {
            x: padding - 10,
            y: y + 5,
            'text-anchor': 'end',
            fill: '#666',
            'font-size': '12'
        });
        label.textContent = formatXP(xpValue);
        svg.appendChild(label);
    }
    
    // Add month labels on X-axis
    const dateRange = maxDate - minDate;
    const monthsToShow = Math.min(6, Math.ceil(dateRange / (30 * 24 * 60 * 60 * 1000)));
    
    for (let i = 0; i <= monthsToShow; i++) {
        const t = i / monthsToShow;
        const timestamp = minDate + (dateRange * t);
        const date = new Date(timestamp);
        const x = padding + (graphWidth * t);
        
        // Draw tick mark
        const tick = createSVGElement('line', {
            x1: x,
            y1: height - padding,
            x2: x,
            y2: height - padding + 5,
            stroke: '#666',
            'stroke-width': '2'
        });
        svg.appendChild(tick);
        
        // Draw month label
        const monthLabel = createSVGElement('text', {
            x: x,
            y: height - padding + 20,
            'text-anchor': 'middle',
            fill: '#666',
            'font-size': '11',
            'font-weight': '500'
        });
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        monthLabel.textContent = `${monthName} '${year}`;
        svg.appendChild(monthLabel);
    }
    
    // Draw line path
    const pathData = dataPoints.map((point, index) => {
        const x = padding + (point.date.getTime() - minDate) / (maxDate - minDate) * graphWidth;
        const y = height - padding - (point.xp / maxXP) * graphHeight;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    const path = createSVGElement('path', {
        d: pathData,
        fill: 'none',
        stroke: '#4CAF50',
        'stroke-width': '3'
    });
    svg.appendChild(path);
    
    // Draw points with tooltips
    dataPoints.forEach(point => {
        const x = padding + (point.date.getTime() - minDate) / (maxDate - minDate) * graphWidth;
        const y = height - padding - (point.xp / maxXP) * graphHeight;
        
        const circle = createSVGElement('circle', {
            cx: x,
            cy: y,
            r: '4',
            fill: '#4CAF50',
            class: 'chart-point'
        });
        
        const title = createSVGElement('title');
        title.textContent = `${formatDate(point.date)}: ${formatXP(point.xp)}`;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });
    
    // Y-axis label only (X-axis has month labels now)
    
    const yLabel = createSVGElement('text', {
        x: -height / 2,
        y: 20,
        'text-anchor': 'middle',
        transform: 'rotate(-90)',
        fill: '#333',
        'font-size': '14',
        'font-weight': '600'
    });
    svg.appendChild(yLabel);
}

// Generate project success/fail pie chart
function generateSuccessPieChart(projects) {
    const svg = document.getElementById('success-chart');
    if (!svg) return;
    
    svg.innerHTML = '';
    
    const passed = projects.filter(p => p.grade > 0).length;
    const failed = projects.filter(p => p.grade === 0).length;
    const total = passed + failed;
    
    if (total === 0) {
        const text = createSVGElement('text', {
            x: '400',
            y: '200',
            'text-anchor': 'middle',
            fill: '#666'
        });
        text.textContent = 'No project data available';
        svg.appendChild(text);
        return;
    }
    
    const centerX = 300;
    const centerY = 200;
    const radius = 120;
    
    const passedPercent = (passed / total) * 100;
    const failedPercent = (failed / total) * 100;
    const passedAngle = (passed / total) * 2 * Math.PI;
    
    // Draw passed slice
    if (passed > 0) {
        const largeArc = passedAngle > Math.PI ? 1 : 0;
        const x = centerX + radius * Math.cos(passedAngle - Math.PI / 2);
        const y = centerY + radius * Math.sin(passedAngle - Math.PI / 2);
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${centerX} ${centerY - radius}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}`,
            'Z'
        ].join(' ');
        
        const passedSlice = createSVGElement('path', {
            d: pathData,
            fill: '#4CAF50',
            stroke: 'white',
            'stroke-width': '2',
            class: 'pie-slice'
        });
        
        const passedTitle = createSVGElement('title');
        passedTitle.textContent = `Passed: ${passed} (${passedPercent.toFixed(1)}%)`;
        passedSlice.appendChild(passedTitle);
        
        svg.appendChild(passedSlice);
    }
    
    // Draw failed slice
    if (failed > 0) {
        const largeArc = (2 * Math.PI - passedAngle) > Math.PI ? 1 : 0;
        const x = centerX + radius * Math.cos(passedAngle - Math.PI / 2);
        const y = centerY + radius * Math.sin(passedAngle - Math.PI / 2);
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x} ${y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${centerX} ${centerY - radius}`,
            'Z'
        ].join(' ');
        
        const failedSlice = createSVGElement('path', {
            d: pathData,
            fill: '#f44336',
            stroke: 'white',
            'stroke-width': '2',
            class: 'pie-slice'
        });
        
        const failedTitle = createSVGElement('title');
        failedTitle.textContent = `Failed: ${failed} (${failedPercent.toFixed(1)}%)`;
        failedSlice.appendChild(failedTitle);
        
        svg.appendChild(failedSlice);
    }
    
    // Draw center circle (donut effect)
    const centerCircle = createSVGElement('circle', {
        cx: centerX,
        cy: centerY,
        r: radius * 0.5,
        fill: 'white'
    });
    svg.appendChild(centerCircle);
    
    // Total in center
    const totalText = createSVGElement('text', {
        x: centerX,
        y: centerY - 10,
        'text-anchor': 'middle',
        'font-size': '32',
        'font-weight': 'bold',
        fill: '#333'
    });
    totalText.textContent = total;
    svg.appendChild(totalText);
    
    const labelText = createSVGElement('text', {
        x: centerX,
        y: centerY + 20,
        'text-anchor': 'middle',
        'font-size': '14',
        fill: '#666'
    });
    labelText.textContent = 'Projects';
    svg.appendChild(labelText);
    
    // Legend
    const legendX = 500;
    const legendY = 150;
    
    // Passed legend
    const passedRect = createSVGElement('rect', {
        x: legendX,
        y: legendY,
        width: '20',
        height: '20',
        fill: '#4CAF50'
    });
    svg.appendChild(passedRect);
    
    const passedLegend = createSVGElement('text', {
        x: legendX + 30,
        y: legendY + 15,
        'font-size': '14',
        fill: '#333'
    });
    passedLegend.textContent = `Passed: ${passed} (${passedPercent.toFixed(1)}%)`;
    svg.appendChild(passedLegend);
    
    // Failed legend
    const failedRect = createSVGElement('rect', {
        x: legendX,
        y: legendY + 30,
        width: '20',
        height: '20',
        fill: '#f44336'
    });
    svg.appendChild(failedRect);
    
    const failedLegend = createSVGElement('text', {
        x: legendX + 30,
        y: legendY + 45,
        'font-size': '14',
        fill: '#333'
    });
    failedLegend.textContent = `Failed: ${failed} (${failedPercent.toFixed(1)}%)`;
    svg.appendChild(failedLegend);
}
