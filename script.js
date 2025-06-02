class IncomeCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.incomeData = {};
        this.serverMode = false; // 检测是否有服务器支持
        
        this.initElements();
        this.bindEvents();
        this.loadData().then(() => {
            this.renderCalendar();
            this.updateStats();
        });
    }
    
    initElements() {
        this.currentMonthElement = document.getElementById('currentMonth');
        this.calendarDaysElement = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.todayBtn = document.getElementById('todayBtn');
        
        this.modal = document.getElementById('incomeModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.incomeInput = document.getElementById('incomeInput');
        this.saveBtn = document.getElementById('saveIncome');
        this.deleteBtn = document.getElementById('deleteIncome');
        this.cancelBtn = document.getElementById('cancelIncome');
        this.closeBtn = document.querySelector('.close');
        
        this.monthlyIncomeElement = document.getElementById('monthlyIncome');
        this.yearlyIncomeElement = document.getElementById('yearlyIncome');
        this.totalIncomeElement = document.getElementById('totalIncome');
        
        // 数据管理元素
        this.exportBtn = document.getElementById('exportData');
        this.importBtn = document.getElementById('importData');
        this.fileInput = document.getElementById('fileInput');
    }
    
    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.todayBtn.addEventListener('click', () => this.goToToday());
        
        this.saveBtn.addEventListener('click', () => this.saveIncome());
        this.deleteBtn.addEventListener('click', () => this.deleteIncome());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // 数据管理事件
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importData());
        this.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        this.incomeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveIncome();
            } else if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.updateStats();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.updateStats();
    }
    
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
        this.updateStats();
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份显示
        this.currentMonthElement.textContent = `${year}年 ${String(month + 1).padStart(2, '0')}月`;
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取第一天是星期几（0=周日，1=周一...）
        const firstDayOfWeek = firstDay.getDay();
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 调整为周一开始
        
        // 获取当月天数
        const daysInMonth = lastDay.getDate();
        
        // 清空日历
        this.calendarDaysElement.innerHTML = '';
        
        // 添加上个月的尾部日期
        const prevMonth = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonth.getDate();
        
        for (let i = adjustedFirstDay - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(
                prevMonthDays - i,
                year,
                month - 1,
                true
            );
            this.calendarDaysElement.appendChild(dayElement);
        }
        
        // 添加当月日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, year, month, false);
            this.calendarDaysElement.appendChild(dayElement);
        }
        
        // 添加下个月的开头日期，补齐42个格子（6行x7列）
        const totalCells = 42;
        const cellsUsed = adjustedFirstDay + daysInMonth;
        const nextMonthDays = totalCells - cellsUsed;
        
        for (let day = 1; day <= nextMonthDays; day++) {
            const dayElement = this.createDayElement(
                day,
                year,
                month + 1,
                true
            );
            this.calendarDaysElement.appendChild(dayElement);
        }
    }
    
    createDayElement(day, year, month, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // 检查是否是今天
        const today = new Date();
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            day === today.getDate() && 
            !isOtherMonth) {
            dayElement.classList.add('today');
        }
        
        // 创建日期键
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // 检查是否有收入记录
        const income = this.incomeData[dateKey];
        if (income !== undefined) {
            if (income > 0) {
                dayElement.classList.add('has-income');
            } else if (income < 0) {
                dayElement.classList.add('has-negative-income');
            }
            dayElement.innerHTML = `
                <span>${day}</span>
                <span class="income-amount">${income}</span>
            `;
        } else {
            dayElement.textContent = day;
        }
        
        // 添加点击事件
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                this.selectedDate = dateKey;
                this.openModal(dateKey, income || 0);
            });
        }
        
        return dayElement;
    }
    
    openModal(dateKey, currentIncome) {
        const [year, month, day] = dateKey.split('-');
        this.modalTitle.textContent = `${year}年${month}月${day}日 - 录入收入`;
        this.incomeInput.value = currentIncome > 0 ? currentIncome : '';
        this.modal.style.display = 'block';
        this.incomeInput.focus();
        
        // 显示或隐藏删除按钮
        this.deleteBtn.style.display = currentIncome > 0 ? 'block' : 'none';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.incomeInput.value = '';
        this.selectedDate = null;
    }
    
    saveIncome() {
        const incomeValue = parseFloat(this.incomeInput.value);
        
        if (isNaN(incomeValue)) {
            alert('请输入有效的收入金额');
            return;
        }
        
        if (incomeValue === 0) {
            delete this.incomeData[this.selectedDate];
        } else {
            this.incomeData[this.selectedDate] = incomeValue;
        }
        
        this.saveData();
        this.renderCalendar();
        this.updateStats();
        this.closeModal();
    }
    
    deleteIncome() {
        if (this.selectedDate && this.incomeData[this.selectedDate]) {
            delete this.incomeData[this.selectedDate];
            this.saveData();
            this.renderCalendar();
            this.updateStats();
            this.closeModal();
        }
    }
    
    updateStats() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth() + 1;
        
        let monthlyTotal = 0;
        let yearlyTotal = 0;
        let grandTotal = 0;
        
        for (const [dateKey, income] of Object.entries(this.incomeData)) {
            const [year, month] = dateKey.split('-').map(Number);
            
            grandTotal += income;
            
            if (year === currentYear) {
                yearlyTotal += income;
                
                if (month === currentMonth) {
                    monthlyTotal += income;
                }
            }
        }
        
        this.monthlyIncomeElement.textContent = `$${Math.round(monthlyTotal)}`;
        this.yearlyIncomeElement.textContent = `$${Math.round(yearlyTotal)}`;
        this.totalIncomeElement.textContent = `$${Math.round(grandTotal)}`;
    }
    
    async loadData() {
        // 首先尝试从服务器加载数据
        try {
            const response = await fetch('/api/income');
            if (response.ok) {
                this.incomeData = await response.json();
                this.serverMode = true;
                console.log('服务器模式：数据从服务器加载');
                return;
            }
        } catch (error) {
            console.log('服务器不可用，使用本地模式');
        }
        
        // 服务器不可用，从localStorage加载
        try {
            const data = localStorage.getItem('incomeCalendarData');
            this.incomeData = data ? JSON.parse(data) : {};
            this.serverMode = false;
            
            // // 如果是首次使用，添加示例数据
            // if (Object.keys(this.incomeData).length === 0) {
            //     const today = new Date();
            //     const year = today.getFullYear();
            //     const month = String(today.getMonth() + 1).padStart(2, '0');
                
            //     this.incomeData = {
            //         [`${year}-${month}-01`]: 100,
            //         [`${year}-${month}-02`]: 50
            //     };
            //     await this.saveData();
            // }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.incomeData = {};
        }
    }
    
    async saveData() {
        if (this.serverMode) {
            // 保存到服务器
            try {
                const response = await fetch('/api/income', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.incomeData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('数据已保存到服务器');
                    return;
                } else {
                    throw new Error('服务器保存失败');
                }
            } catch (error) {
                console.error('服务器保存失败，fallback到localStorage:', error);
                this.serverMode = false; // 切换到本地模式
            }
        }
        
        // 保存到localStorage（服务器不可用时的备选方案）
        try {
            localStorage.setItem('incomeCalendarData', JSON.stringify(this.incomeData));
            console.log('数据已保存到本地存储');
        } catch (error) {
            console.warn('localStorage保存失败，数据仅保存在内存中');
        }
    }
    
    // 导出数据到文件
    exportData() {
        try {
            const dataToExport = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                data: this.incomeData
            };
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `收入统计_${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('数据导出成功！');
        } catch (error) {
            console.error('导出失败:', error);
            alert('数据导出失败，请重试');
        }
    }
    
    // 触发文件选择
    importData() {
        this.fileInput.click();
    }
    
    // 处理文件导入
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (importedData.data && typeof importedData.data === 'object') {
                    // 确认导入
                    const confirmImport = confirm(
                        `即将导入数据文件（导出时间：${new Date(importedData.exportDate).toLocaleString()}）\n` +
                        '这将覆盖当前所有数据，是否继续？'
                    );
                    
                    if (confirmImport) {
                        this.incomeData = importedData.data;
                        this.saveData();
                        this.renderCalendar();
                        this.updateStats();
                        alert('数据导入成功！');
                    }
                } else {
                    alert('文件格式不正确，请选择有效的数据文件');
                }
            } catch (error) {
                console.error('导入失败:', error);
                alert('文件解析失败，请检查文件格式');
            }
        };
        
        reader.readAsText(file);
        // 清空文件输入，允许重复选择同一文件
        event.target.value = '';
    }
}

// 页面加载完成后初始化日历
document.addEventListener('DOMContentLoaded', () => {
    new IncomeCalendar();
}); 