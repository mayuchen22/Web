// 数据与类封装
class Ticket {
    constructor(movieName, showTime, seats, status) {
        this.movieName = movieName; // 电影名称
        this.showTime = showTime; // 放映时间
        this.seats = seats; // 座位信息
        this.status = status; // 票状态
    }
}

// UI 操作模块
const TicketUI = {
    /**
     * @param {string} elementId - 待隐藏的元素 ID
     * @description 隐藏指定 ID 的元素。
     */
    hideElement: function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    /**
     * @param {string} message - 要显示的警告消息
     * @description 显示一个警告对话框。
     */
    showAlert: function (message) {
        alert(message);
    },

    /**
     * @param {Ticket} ticket - 票据对象
     * @description 渲染单张电影票到页面。
     */
    renderTicket: function (ticket) {
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-info">
                    <h3>电影名称: ${ticket.movieName}</h3>
                    <p>放映时间: ${ticket.showTime}</p>
                    <p>座位: ${ticket.seats.join(', ')}</p>
                    <p class="ticket-status status-${ticket.status}" data-status="${ticket.status}">状态: ${ticket.status}</p>
                </div>
                <button class="btn-danger refund-btn">
                    <i class="fas fa-undo"></i> 退票
                </button>
            `;
            ticketList.appendChild(ticketItem);
        }
    }
};

// 事件处理模块
const TicketEvents = {
    /**
     * @description 处理退票按钮点击事件。
     */
    onRefundClick: function (event) {
        if (event.target.classList.contains('refund-btn')) {
            const ticketItem = event.target.closest('.ticket-item');
            if (ticketItem) {
                // ticketItem.remove();
                TicketUI.showAlert('退票成功！');
            }
        }
    }
};

// 初始化模块
const TicketWeb = {
    /**
     * @description 初始化票夹页面。
     */
    init: function () {
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.addEventListener('click', TicketEvents.onRefundClick);
        }

        // // 示例：添加一张电影票
        // const sampleTicket = new Ticket('示例电影', '2025年7月10日 19:00', ['A10', 'A11'], 'unpaid');
        // TicketUI.renderTicket(sampleTicket);
    }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    TicketWeb.init();
});
