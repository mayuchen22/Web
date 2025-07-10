// 全局变量，用于存储票据列表
let ticketList = null;
class Ticket {
    constructor(movieName, showTime, seats, status) {
        this.movieName = movieName; // 电影名称
        this.showTime = showTime; // 放映时间
        this.seats = seats; // 座位信息
        this.status = status; // 票状态
    }
}
class TicketList {
    constructor() {
        this.tickets = []; // 存储所有票据
    }

    /**
     * @param {Ticket} ticket - 要添加的票据对象
     * @description 添加一张票据到列表。
     */
    addTicket(ticket) {
        if (ticket instanceof Ticket) {
            this.tickets.push(ticket);
        } else {
            console.error('Invalid ticket object');
        }
    }

    /**
     * @description 将所有的数据存储到浏览器的 sessionStorage 中。
     */
    storeTickets() {
        sessionStorage.setItem('tickets', JSON.stringify(this.tickets));
        // TODO: 此处或许可以通过改变key值的方式实现不同用户间的票据隔离
    }

    /**
     * @description 从 sessionStorage 中获取票据数据并加载到列表中。
     */
    pullTickets() {
        const storedTickets = sessionStorage.getItem('tickets');
        if (storedTickets) {
            try {
                this.tickets = JSON.parse(storedTickets).map(ticketData => new Ticket(
                    ticketData.movieName,
                    ticketData.showTime,
                    ticketData.seats,
                    ticketData.status
                ));
            } catch (error) {
                console.error('Error parsing tickets from sessionStorage:', error);
            }
        } else {
            this.tickets = []; // 如果没有存储的票据，则初始化为空数组
        }
    }
}


document.addEventListener('DOMContentLoaded', function () {

    // 初始化票据列表
    ticketList = new TicketList();
    ticketList.pullTickets(); // 从 sessionStorage 中加载票据数据

    // 获取Canvas元素和上下文
    const canvas = document.getElementById('cinemaCanvas');
    const ctx = canvas.getContext('2d');

    // DOM元素
    const groupMembers = document.getElementById('groupMembers');

    // 影院配置
    let cinemaConfig = {
        rows: 10,
        cols: 20,
        totalSeats: 200
    };

    // 当前团体人数
    let groupNum = 2;

    let membersData = [];

    let currentAgeRestriction = {
        isChild: false,
        isSenior: false
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
        const startY = 100;
        const rowSpacing = 40;

        // const maxRadius = 15;
        // const horizontalSpacing = 33;
        // 动态计算绘图参数以适应不同大小的放映厅

        const baseCols = 20;
        const baseRadius = 15;
        const baseSpacing = 30;

        const scale = Math.min(1, baseCols / cinemaConfig.cols);

        const maxRadius = Math.max(8, baseRadius * scale); // 半径最小不低于8
        const horizontalSpacing = Math.max(16, baseSpacing * scale); // 间距最小不低于16

        const baseCurveFactor = 0.4;
        const curveFactor = baseCurveFactor * scale;
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
                const seatY = rowY - curveOffset;

                // 设置座位半径
                const seatRadius = maxRadius;

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
                        ctx.fillStyle = '#8AD97C'; // 绿色
                        break;
                    case SEAT_SELECTED:
                        ctx.fillStyle = '#F5D502'; // 黄色
                        break;
                    case SEAT_OCCUPIED:
                        ctx.fillStyle = '#FF0004'; // 红色
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
                if (col === 0) { // 只在每排的第一个座位处绘制行号
                    const textX = seatX - seatRadius - 10; // X坐标：圆心X - 半径 - 10像素间距
                    const textY = seatY;                   // Y坐标：与圆心Y相同

                    ctx.fillStyle = '#4a6fa5';      // 设置文本颜色
                    ctx.font = 'bold 12px Arial';   // 设置字体
                    ctx.textAlign = 'right';        // 文本右对齐
                    ctx.textBaseline = 'middle';    // 垂直居中对齐
                    ctx.fillText(`第${row + 1}排`, textX, textY);
                }
            }
        }

        // // 绘制行号
        // ctx.fillStyle = '#4a6fa5';
        // ctx.font = 'bold 12px Arial';
        // ctx.textAlign = 'right';
        // ctx.textBaseline = 'middle';

        // for (let row = 0; row < cinemaConfig.rows; row++) {
        //     const rowY = startY + row * rowSpacing;
        //     ctx.fillText(`第${row+1}排`, 40, rowY + 5);
        // }

    }

    let canSelectSeats = false;  // 控制是否允许选座
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

        // 检查是否点击了座位 
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
        // 获取售票类型
        const ticketType = document.getElementById('ticketType').value;

        // 如果不允许选座，直接返回
        if (!canSelectSeats) {
            document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先点击"手动选座"按钮';
            return;
        }

        if (ticketType === 'individual') {
            // 单选逻辑
            // 先清除所有已选座位
            selectedSeats.forEach(s => {
                if (s.state === SEAT_SELECTED) s.state = SEAT_AVAILABLE;
            });
            selectedSeats = [];
            updateSelectionInfo();
            drawCinema();

            // 检查年龄限制
            if (currentAgeRestriction.isChild && seat.row <= 3) {
                document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 15岁以下观众不能选择前三排座位';
                return;
            }
            if (currentAgeRestriction.isSenior && seat.row > cinemaConfig.rows - 3) {
                document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 60岁以上观众不能选择最后三排座位';
                return;
            }

            // 已售座位不可选择
            if (seat.state === SEAT_OCCUPIED) {
                document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 该座位已售出，无法选择';
                // 更新选座数量
                document.getElementById('selectedSeats').textContent = selectedSeats.length;
                return;
            }

            // 选择当前座位
            if (seat.state === SEAT_AVAILABLE) {
                seat.state = SEAT_SELECTED;
                selectedSeats.push(seat);
                document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 选座成功';
            }
        }
        else if (ticketType === 'group') {
            // 根据团体成员年龄确定可选排数范围
            let minRow = 1;
            let maxRow = cinemaConfig.rows;

            // 检查是否有15岁以下成员或60岁以上成员
            let hasChild = false;
            let hasSenior = false;
            for (let i = 0; i < groupNum; i++) {
                let name = membersData[i].name;
                let age = parseInt(membersData[i].age);
                if (membersData[i].isChild) {
                    hasChild = true;
                }
                if (membersData[i].isSenior) {
                    hasSenior = true;
                }
            }

            if (hasChild) minRow = 4;
            if (hasSenior) maxRow = cinemaConfig.rows - 3;

            // 检查是否按住Ctrl键（多选）
            if (event.ctrlKey) {
                // 多选逻辑

                if (selectedSeats.length <= 0) {
                    if (seat.row < minRow) {
                        document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 团体中有15岁以下观众，不能选择前三排座位';
                        return;
                    }
                    else if (seat.row > maxRow) {
                        document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 60岁以上观众不能选择最后三排座位';
                        return;
                    }
                    else if (seat.state === SEAT_OCCUPIED) {
                        document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 该座位已售出，无法选择';
                        return;
                    }
                    else if (seat.state === SEAT_AVAILABLE) {
                        seat.state = SEAT_SELECTED;
                        selectedSeats.push(seat);
                    }
                }
                else if (seat.state === SEAT_SELECTED) {
                    seat.state = SEAT_AVAILABLE;
                    const index = selectedSeats.findIndex(s => s.row === seat.row && s.col === seat.col);
                    if (index !== -1) selectedSeats.splice(index, 1);
                }
                else if (selectedSeats.length === groupNum) {
                    alert('选座已达最大人数!');
                    return;
                }
                else if (seat.row !== selectedSeats[0].row) {
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 团体票成员必须选择同一排座位';
                    return;
                }
                else {
                    if (seat.state === SEAT_OCCUPIED) {
                        document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 该座位已售出，无法选择';
                        return;
                    }
                    else if (seat.state === SEAT_AVAILABLE) {
                        seat.state = SEAT_SELECTED;
                        selectedSeats.push(seat);
                    }
                }
            } else {
                // 单选逻辑
                // 先清除所有已选座位
                selectedSeats.forEach(s => {
                    if (s.state === SEAT_SELECTED) s.state = SEAT_AVAILABLE;
                });
                selectedSeats = [];
                updateSelectionInfo();
                drawCinema();

                // 检查年龄限制
                if (seat.row < minRow) {
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 15岁以下观众不能选择前三排座位';
                    alert('团体中有15岁以下观众，不能选择前三排座位!');
                    return;
                }
                if (seat.row > maxRow) {
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 60岁以上观众不能选择最后三排座位';
                    alert('团体中有60岁以上观众，不能选择最后三排座位!');
                    return;
                }

                // 已售座位不可选择
                if (seat.state === SEAT_OCCUPIED) {
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 该座位已售出，无法选择';
                    alert('该座位已售出，无法选择!');
                    // 更新选座数量
                    document.getElementById('selectedSeats').textContent = selectedSeats.length;
                    return;
                }

                // 选择当前座位
                else if (seat.state === SEAT_AVAILABLE) {
                    seat.state = SEAT_SELECTED;
                    selectedSeats.push(seat);
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 选座成功';
                }
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
        const age = parseInt(document.getElementById('age').value);
        const name = document.getElementById('name').value;

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

        // 从中间排开始向两边找
        const middleRow = Math.floor(cinemaConfig.rows / 2);
        for (let rowOffset = 0; rowOffset <= cinemaConfig.rows; rowOffset++) {
            // 先尝试下方排（远离屏幕）
            const rowDown = middleRow + rowOffset;
            if (rowDown >= minRow && rowDown <= maxRow) {
                const seat = findSeatInRow(rowDown);
                if (seat) {
                    selectSeat(seat);
                    found = true;
                    break;
                }
            }

            // 再尝试上方排（靠近屏幕）
            if (rowOffset > 0) {
                const rowUp = middleRow - rowOffset;
                if (rowUp >= minRow && rowUp <= maxRow) {
                    const seat = findSeatInRow(rowUp);
                    if (seat) {
                        selectSeat(seat);
                        found = true;
                        break;
                    }
                }
            }
        }

        // 在指定行中从中间向两边找座位的辅助函数
        function findSeatInRow(row) {
            const middleCol = Math.floor(cinemaConfig.cols / 2);
            for (let colOffset = 0; colOffset <= middleCol; colOffset++) {
                // 尝试右侧
                const colRight = middleCol + colOffset;
                if (colRight < cinemaConfig.cols) {
                    const seat = seats[row - 1][colRight];
                    if (seat.state === SEAT_AVAILABLE) {
                        return seat;
                    }
                }

                // 尝试左侧
                if (colOffset > 0) {
                    const colLeft = middleCol - colOffset;
                    if (colLeft >= 0) {
                        const seat = seats[row - 1][colLeft];
                        if (seat.state === SEAT_AVAILABLE) {
                            return seat;
                        }
                    }
                }
            }
            return null;
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
        const groupSize = groupNum;

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

        // 检查是否有15岁以下成员或60岁以上成员
        let hasChild = false;
        let hasSenior = false;
        for (let i = 0; i < groupNum; i++) {
            let name = membersData[i].name;
            let age = parseInt(membersData[i].age);
            if (membersData[i].isChild) {
                hasChild = true;
            }
            if (membersData[i].isSenior) {
                hasSenior = true;
            }
        }

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

    //手动选座
    function handleManualSelect() {
        const ticketType = document.getElementById('ticketType').value;
        if (ticketType === 'individual') {
            const name = document.getElementById('name').value.trim();
            const age = parseInt(document.getElementById('age').value);

            // 验证姓名和年龄
            if (!name || isNaN(age)) {
                document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先填写有效的姓名和年龄';
                canSelectSeats = false;
                return;
            }

            // 存储年龄限制信息到全局变量
            currentAgeRestriction = {
                isChild: age < 15,
                isSenior: age >= 60
            };

            canSelectSeats = true;

            // 根据年龄显示不同的提示信息
            if (currentAgeRestriction.isChild) {
                document.getElementById('status').innerHTML = `<i class="fas fa-child"></i> ${name}（${age}岁，少年）已启用选座模式（避开前三排）`;
            } else if (currentAgeRestriction.isSenior) {
                document.getElementById('status').innerHTML = `<i class="fas fa-user-tie"></i> ${name}（${age}岁，老年）已启用选座模式（避开最后三排）`;
            } else {
                document.getElementById('status').innerHTML = `<i class="fas fa-user"></i> ${name}（${age}岁，成年）已启用选座模式`;
            }
        }
        // 如果是团体票，检查团体人数
        else if (ticketType === 'group') {
            saveInputData();
            for (let i = 0; i < groupNum; i++) {
                let name = membersData[i].name;
                let age = parseInt(membersData[i].age);
                if (!name || isNaN(age)) {
                    document.getElementById('status').innerHTML = '<i class="fas fa-exclamation-triangle"></i> 请先填写有效的姓名和年龄';
                    canSelectSeats = false;
                    alert('姓名和年龄不能为空！');
                    return;
                }
            }
            canSelectSeats = true;
            document.getElementById('status').innerHTML = `<i class="fas fa-user"></i> 已启用选座模式`;
        }
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
        canSelectSeats = false;
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
        canSelectSeats = false;
        selectedSeats = [];
        updateSelectionInfo();
        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 预订已取消';
        canSelectSeats = false;
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

        // console.log('已售座位:', selectedSeats);
        const seatsPositions = selectedSeats.map(s => `${s.row}-${s.col}`).join(', ');
        console.log('已售座位位置:', seatsPositions);

        // 更新座位统计
        const soldCount = parseInt(document.getElementById('soldSeats').textContent) + selectedSeats.length;
        const availableCount = parseInt(document.getElementById('availableSeats').textContent) - selectedSeats.length;
        document.getElementById('soldSeats').textContent = soldCount;
        document.getElementById('availableSeats').textContent = availableCount;
        document.getElementById('selectedSeats').textContent = '0';

        document.getElementById('status').innerHTML = '<i class="fas fa-check-circle"></i> 购票成功！感谢您的购买！';
        selectedSeats = [];
        canSelectSeats = false;
        updateSelectionInfo();
        drawCinema();

        // ver2: 向list中同步数据
        const movieName = "默认电影"
        const showTime = "1900年1月1日 00:00"; // 这里可以替换为实际的电影名称和放映时间
        const status = 'paid';
        const ticket = new Ticket(movieName, showTime, seatsPositions, status);
        console.log('购票信息:', ticket);
        ticketList.addTicket(ticket);
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
        canSelectSeats = false;
        drawCinema();
    }

    // 跳转到票夹页面
    function viewTickets() {
        // 将票据列表存储到 sessionStorage
        ticketList.storeTickets();
        console.log('sessionStorage:', JSON.stringify(sessionStorage));
        // 跳转到票夹页面
        window.location.href = 'tickets.html';
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

    // 监听团体人数改变
    document.getElementById("groupSize").addEventListener("input", function () {
        handleGroupSizeChange(this.value);  // 触发处理函数并传递当前值
    });

    // 团体人数输入变化
    function handleGroupSizeChange(value) {
        // 存储年龄限制信息到全局变量
        groupNum = value;

        // 更新团队成员信息输入框
        const groupMembersContainer = document.getElementById('groupMembers');
        groupMembersContainer.innerHTML = '';

        for (let i = 0; i < value; i++) {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'member-input';

            memberDiv.innerHTML = `
                <div class="member-number">${i + 1}</div>
                <input type="text" placeholder="姓名" class="member-name" >
                <input type="number" placeholder="年龄" min="1" max="120" 
                        class="member-age" >
            `;

            groupMembersContainer.appendChild(memberDiv);
        }
    }

    // 事件委托处理输入变化
    groupMembers.addEventListener('input', (e) => {
        if (e.target.classList.contains('member-name') ||
            e.target.classList.contains('member-age')) {
            saveInputData();
        }
    });

    // 保存输入数据到数组
    function saveInputData() {
        membersData = [];
        const containers = document.querySelectorAll('.member-input');

        containers.forEach(container => {
            const nameInput = container.querySelector('.member-name');
            const ageInput = container.querySelector('.member-age');

            membersData.push({
                name: nameInput.value,
                age: ageInput.value,
                isChild: ageInput.value < 15,
                isSenior: ageInput.value >= 60
            });
        });
    }

    // 绑定按钮事件
    document.getElementById('autoSelectBtn').addEventListener('click', autoSelectSeats);
    document.getElementById('manualSelectBtn').addEventListener('click', handleManualSelect);
    document.getElementById('bookBtn').addEventListener('click', bookSeats);
    // document.getElementById('cancelBtn').addEventListener('click', cancelBooking);
    document.getElementById('buyBtn').addEventListener('click', buyTickets);
    // document.getElementById('refundBtn').addEventListener('click', refundTickets);
    document.getElementById('viewTicketsBtn').addEventListener('click', viewTickets);

    // 初始化
    initializeSeats();
});
