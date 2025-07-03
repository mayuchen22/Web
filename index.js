
document.addEventListener('DOMContentLoaded', function () {
    // 获取Canvas元素和上下文
    const canvas = document.getElementById('cinemaCanvas');
    const ctx = canvas.getContext('2d');

    // 影院配置
    let cinemaConfig = {
        rows: 10,
        cols: 20,
        totalSeats: 200
    };

    // 座位状态常量
    const SEAT_AVAILABLE = 0;
    const SEAT_SELECTED = 1;
    const SEAT_OCCUPIED = 2;

    // 座位数据
    let seats = [];
    let selectedSeats = [];

    // 初始化座位数据
    function initializeSeats() {
        seats = [];
        selectedSeats = [];
        let availableCount = 0;
        let occupiedCount = 0;

        for (let row = 0; row < cinemaConfig.rows; row++) {
            const rowSeats = [];
            for (let col = 0; col < cinemaConfig.cols; col++) {
                // 随机生成一些已售座位（20%）
                const state = Math.random() > 0.8 ? SEAT_OCCUPIED : SEAT_AVAILABLE;
                rowSeats.push({
                    row: row + 1,
                    col: col + 1,
                    state: state,
                    x: 0,
                    y: 0,
                    radius: 0
                });

                if (state === SEAT_AVAILABLE) availableCount++;
                if (state === SEAT_OCCUPIED) occupiedCount++;
            }
            seats.push(rowSeats);
        }

        // 更新统计信息
        document.getElementById('availableSeats').textContent = availableCount;
        document.getElementById('soldSeats').textContent = occupiedCount;
        document.getElementById('selectedSeats').textContent = '0';

        updateSelectionInfo();
        drawCinema();
    }

    // 绘制影院座位
    function drawCinema() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const startY = 50;
        const rowSpacing = 40;
        const maxRadius = 15;
        const horizontalSpacing = 25;

        // 绘制每一排座位
        for (let row = 0; row < cinemaConfig.rows; row++) {
            // 弧形排列计算
            const curveFactor = 0.4;
            const rowY = startY + row * rowSpacing;

            // 该排座位数量
            const seatsInRow = cinemaConfig.cols;

            // 计算该排起始位置
            const startX = centerX - ((seatsInRow - 1) * horizontalSpacing) / 2;

            for (let col = 0; col < seatsInRow; col++) {
                // 弧形偏移
                const curveOffset = Math.pow(Math.abs(col - (seatsInRow - 1) / 2), 2) * curveFactor;
                const seatX = startX + col * horizontalSpacing;
                const seatY = rowY + curveOffset;

                // 设置座位半径
                const seatRadius = maxRadius - (row * 0.5);

                // 保存座位位置信息
                seats[row][col].x = seatX;
                seats[row][col].y = seatY;
                seats[row][col].radius = seatRadius;

                // 绘制座位
                ctx.beginPath();
                ctx.arc(seatX, seatY, seatRadius, 0, Math.PI * 2);

                // 设置座位颜色
                switch (seats[row][col].state) {
                    case SEAT_AVAILABLE:
                        ctx.fillStyle = '#4CAF50'; // 绿色
                        break;
                    case SEAT_SELECTED:
                        ctx.fillStyle = '#FFC107'; // 黄色
                        break;
                    case SEAT_OCCUPIED:
                        ctx.fillStyle = '#F44336'; // 红色
                        break;
                }

                ctx.fill();
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                ctx.stroke();

                // 绘制座位编号
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${row + 1}-${col + 1}`, seatX, seatY);
            }
        }

        // 绘制行号
        ctx.fillStyle = '#4a6fa5';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (let row = 0; row < cinemaConfig.rows; row++) {
            const rowY = startY + row * rowSpacing;
            ctx.fillText(`第${row + 1}排`, 40, rowY + 5);
        }
    }

    // 处理Canvas点击事件
    // 处理Canvas点击事件
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect(); // 获取canvas元素在屏幕上的位置和尺寸

        // 计算鼠标点击位置相对于 *显示元素* 的坐标
        const mouseXOnElement = event.clientX - rect.left;
        const mouseYOnElement = event.clientY - rect.top;

        // 计算CSS显示尺寸和HTML画布分辨率之间的缩放比例
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // 将点击坐标按比例换算，得到在800x500画布内部的真实坐标
        const mouseX = mouseXOnElement * scaleX;
        const mouseY = mouseYOnElement * scaleY;

        // 检查是否点击了座位 (这部分代码保持不变)
        for (let row = 0; row < cinemaConfig.rows; row++) {
            for (let col = 0; col < cinemaConfig.cols; col++) {
                const seat = seats[row][col];
                const distance = Math.sqrt(Math.pow(mouseX - seat.x, 2) + Math.pow(mouseY - seat.y, 2));

                if (distance <= seat.radius) {
                    handleSeatClick(seat, event);
                    return;
                }
            }
        }
    });

    // 处理座位点击
    function handleSeatClick(seat, event) {
        // 已售座位不可选择
        if (seat.state === SEAT_OCCUPIED) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 该座位已售出，无法选择';
            return;
        }

        // 检查是否按住Ctrl键（多选）
        if (event.ctrlKey) {
            // 多选逻辑
            if (seat.state === SEAT_AVAILABLE) {
                seat.state = SEAT_SELECTED;
                selectedSeats.push(seat);
            } else if (seat.state === SEAT_SELECTED) {
                seat.state = SEAT_AVAILABLE;
                const index = selectedSeats.findIndex(s => s.row === seat.row && s.col === seat.col);
                if (index !== -1) selectedSeats.splice(index, 1);
            }
        } else {
            // 单选逻辑
            // 先清除所有已选座位
            selectedSeats.forEach(s => {
                if (s.state === SEAT_SELECTED) s.state = SEAT_AVAILABLE;
            });
            selectedSeats = [];

            // 选择当前座位
            if (seat.state === SEAT_AVAILABLE) {
                seat.state = SEAT_SELECTED;
                selectedSeats.push(seat);
            }
        }

        // 更新选座数量
        document.getElementById('selectedSeats').textContent = selectedSeats.length;

        updateSelectionInfo();
        drawCinema();
    }

    // 更新选座信息显示
    function updateSelectionInfo() {
        const infoElement = document.getElementById('selectionInfo');

        if (selectedSeats.length === 0) {
            infoElement.textContent = '尚未选择任何座位';
            return;
        }

        let infoText = `已选座位：`;
        selectedSeats.forEach((seat, index) => {
            infoText += `${seat.row}排${seat.col}座`;
            if (index < selectedSeats.length - 1) infoText += ', ';
        });

        infoElement.textContent = infoText;
    }

    // 自动选座功能
    function autoSelectSeats() {
        const ticketType = document.getElementById('ticketType').value;

        if (ticketType === 'individual') {
            autoSelectIndividual();
        } else {
            autoSelectGroup();
        }
    }

    // 个人票自动选座
    function autoSelectIndividual() {
        const age = parseInt(document.getElementById('age').value) || 0;
        const name = document.getElementById('name').value || '观众';

        if (!name || !age) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请填写姓名和年龄';
            return;
        }

        // 清除之前的选择
        selectedSeats.forEach(seat => {
            if (seat.state === SEAT_SELECTED) seat.state = SEAT_AVAILABLE;
        });
        selectedSeats = [];

        // 根据年龄确定可选排数范围
        let minRow = 1;
        let maxRow = cinemaConfig.rows;

        if (age < 15) { // 少年
            minRow = 4;
            document.getElementById('status').innerHTML = `<i class="fas fa-child"></i> ${name}（${age}岁，少年）自动选座：避开前三排`;
        } else if (age >= 60) { // 老年人
            maxRow = cinemaConfig.rows - 3;
            document.getElementById('status').innerHTML = `<i class="fas fa-user-tie"></i> ${name}（${age}岁，老年）自动选座：避开最后三排`;
        } else { // 成年人
            document.getElementById('status').innerHTML = `<i class="fas fa-user"></i> ${name}（${age}岁，成年）自动选座：最佳位置`;
        }

        // 寻找最佳座位（中间靠后位置）
        let found = false;

        // 从中间排开始向后找
        for (let row = Math.floor(cinemaConfig.rows / 2); row <= maxRow; row++) {
            if (row < minRow) continue;

            // 从中间列开始向两边找
            const middleCol = Math.floor(cinemaConfig.cols / 2);
            for (let offset = 0; offset <= middleCol; offset++) {
                // 尝试右侧
                const colRight = middleCol + offset;
                if (colRight < cinemaConfig.cols) {
                    const seat = seats[row - 1][colRight];
                    if (seat.state === SEAT_AVAILABLE) {
                        selectSeat(seat);
                        found = true;
                        break;
                    }
                }

                // 尝试左侧
                if (offset > 0) {
                    const colLeft = middleCol - offset;
                    if (colLeft >= 0) {
                        const seat = seats[row - 1][colLeft];
                        if (seat.state === SEAT_AVAILABLE) {
                            selectSeat(seat);
                            found = true;
                            break;
                        }
                    }
                }
            }

            if (found) break;
        }

        if (!found) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 没有找到符合条件的座位';
        }

        // 更新选座数量
        document.getElementById('selectedSeats').textContent = selectedSeats.length;

        drawCinema();
    }

    // 团体票自动选座
    function autoSelectGroup() {
        const groupSize = parseInt(document.getElementById('groupSize').value) || 2;

        if (groupSize < 2 || groupSize > 20) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 团体人数需在2-20人之间';
            return;
        }

        // 清除之前的选择
        selectedSeats.forEach(seat => {
            if (seat.state === SEAT_SELECTED) seat.state = SEAT_AVAILABLE;
        });
        selectedSeats = [];

        // 根据团体成员年龄确定可选排数范围
        let minRow = 1;
        let maxRow = cinemaConfig.rows;

        // 这里简化处理，实际应检查所有成员年龄
        const hasChild = false; // 实际应检查是否有15岁以下成员
        const hasSenior = false; // 实际应检查是否有60岁以上成员

        if (hasChild) minRow = 4;
        if (hasSenior) maxRow = cinemaConfig.rows - 3;

        // 寻找连续座位
        let found = false;

        for (let row = minRow - 1; row < maxRow; row++) {
            let consecutive = 0;
            let startCol = -1;

            for (let col = 0; col < cinemaConfig.cols; col++) {
                if (seats[row][col].state === SEAT_AVAILABLE) {
                    consecutive++;
                    if (consecutive === 1) startCol = col;

                    if (consecutive >= groupSize) {
                        // 找到连续座位
                        for (let i = 0; i < groupSize; i++) {
                            selectSeat(seats[row][startCol + i]);
                        }
                        found = true;
                        document.getElementById('status').innerHTML = `<i class="fas fa-users"></i> 已为${groupSize}人团体选择第${row + 1}排连续座位`;
                        break;
                    }
                } else {
                    consecutive = 0;
                }
            }

            if (found) break;
        }

        if (!found) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 没有找到符合条件的连续座位';
        }

        // 更新选座数量
        document.getElementById('selectedSeats').textContent = selectedSeats.length;

        drawCinema();
    }

    // 选择座位辅助函数
    function selectSeat(seat) {
        seat.state = SEAT_SELECTED;
        selectedSeats.push(seat);
        updateSelectionInfo();
    }

    // 票务操作
    function bookSeats() {
        if (selectedSeats.length === 0) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先选择座位';
            return;
        }

        selectedSeats.forEach(seat => {
            seat.state = SEAT_SELECTED; // 预订状态
        });

        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 座位已成功预订！';
        drawCinema();
    }

    function cancelBooking() {
        if (selectedSeats.length === 0) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先选择已预订的座位';
            return;
        }

        selectedSeats.forEach(seat => {
            if (seat.state === SEAT_SELECTED) {
                seat.state = SEAT_AVAILABLE;
            }
        });

        // 更新座位统计
        const availableCount = parseInt(document.getElementById('availableSeats').textContent) + selectedSeats.length;
        document.getElementById('availableSeats').textContent = availableCount;
        document.getElementById('selectedSeats').textContent = '0';

        selectedSeats = [];
        updateSelectionInfo();
        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 预订已取消';
        drawCinema();
    }

    function buyTickets() {
        if (selectedSeats.length === 0) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先选择座位';
            return;
        }

        selectedSeats.forEach(seat => {
            seat.state = SEAT_OCCUPIED; // 已售状态
        });

        // 更新座位统计
        const soldCount = parseInt(document.getElementById('soldSeats').textContent) + selectedSeats.length;
        const availableCount = parseInt(document.getElementById('availableSeats').textContent) - selectedSeats.length;
        document.getElementById('soldSeats').textContent = soldCount;
        document.getElementById('availableSeats').textContent = availableCount;
        document.getElementById('selectedSeats').textContent = '0';

        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 购票成功！感谢您的购买！';
        selectedSeats = [];
        updateSelectionInfo();
        drawCinema();
    }

    function refundTickets() {
        if (selectedSeats.length === 0) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先选择已购票的座位';
            return;
        }

        selectedSeats.forEach(seat => {
            if (seat.state === SEAT_OCCUPIED) {
                seat.state = SEAT_AVAILABLE;
            }
        });

        // 更新座位统计
        const soldCount = parseInt(document.getElementById('soldSeats').textContent) - selectedSeats.length;
        const availableCount = parseInt(document.getElementById('availableSeats').textContent) + selectedSeats.length;
        document.getElementById('soldSeats').textContent = soldCount;
        document.getElementById('availableSeats').textContent = availableCount;
        document.getElementById('selectedSeats').textContent = '0';

        selectedSeats = [];
        updateSelectionInfo();
        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 退票成功';
        drawCinema();
    }

    // 切换票务类型
    document.getElementById('ticketType').addEventListener('change', function () {
        if (this.value === 'individual') {
            document.getElementById('individualForm').style.display = 'block';
            document.getElementById('groupForm').style.display = 'none';
        } else {
            document.getElementById('individualForm').style.display = 'none';
            document.getElementById('groupForm').style.display = 'block';
        }
    });

    // 改变放映厅大小
    document.getElementById('cinemaSize').addEventListener('change', function () {
        const size = parseInt(this.value);

        if (size === 100) {
            cinemaConfig.rows = 10;
            cinemaConfig.cols = 10;
            cinemaConfig.totalSeats = 100;
        } else if (size === 200) {
            cinemaConfig.rows = 10;
            cinemaConfig.cols = 20;
            cinemaConfig.totalSeats = 200;
        } else if (size === 300) {
            cinemaConfig.rows = 10;
            cinemaConfig.cols = 30;
            cinemaConfig.totalSeats = 300;
        }

        // 调整Canvas大小
        canvas.width = 800;
        canvas.height = 500;

        initializeSeats();
    });

    // 绑定按钮事件
    document.getElementById('autoSelectBtn').addEventListener('click', autoSelectSeats);
    document.getElementById('bookBtn').addEventListener('click', bookSeats);
    document.getElementById('cancelBtn').addEventListener('click', cancelBooking);
    document.getElementById('buyBtn').addEventListener('click', buyTickets);
    document.getElementById('refundBtn').addEventListener('click', refundTickets);

    // 初始化
    initializeSeats();
});
