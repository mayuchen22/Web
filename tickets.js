// 数据与类封装
class Ticket {
    constructor(movieName, showTime, seats, status) {
        this.movieName = movieName; // 电影名称
        this.showTime = showTime; // 放映时间
        this.seats = seats; // 座位信息
        this.status = status; // 票状态
    }
}

// 弹窗动画工具函数
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log(`[showModal] before:`, modal.className);
        modal.classList.remove('hidden');
        // 用 requestAnimationFrame 保证浏览器渲染后再加 show，触发动画
        requestAnimationFrame(() => {
            modal.classList.add('show');
            console.log(`[showModal] after add show:`, modal.className);
        });
    }
}
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log(`[hideModal] before:`, modal.className);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            console.log(`[hideModal] after add hidden:`, modal.className);
        }, 300);
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
     * @param {string} message - 要显示的警告消息
     * @param {HTMLElement|null} ticketItem - 票据项元素
     * @description 显示自定义警告对话框。
     */
    showMyAlert: function (message, ticketItem = null) {
        // 如果没有传入票据项，则不进行任何操作
        if (!ticketItem) {
            return;
        }

        // 显示自定义警告对话框
        const alertBox = document.getElementById('customAlert');
        const alertMessage = document.getElementById('alertMessage');
        if (alertBox && alertMessage) {
            alertMessage.textContent = message;
            showModal('customAlert');
        }

        // 添加关闭按钮事件监听
        const closeAlertButton = document.getElementById('closeAlert');
        if (closeAlertButton) {
            const closeHandler = this.hideMyAlert.bind(this, ticketItem);
            closeAlertButton.addEventListener('click', closeHandler);

            // 记录事件监听器，便于后续移除
            closeAlertButton._closeHandler = closeHandler;
        }
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 关闭自定义警告对话框。
     */
    hideMyAlert: function (ticketItem) {
        hideModal('customAlert');
        // // 关闭自定义警告对话框
        // const alertBox = document.getElementById('customAlert');
        // if (alertBox) {
        //     alertBox.classList.add('hidden');
        // }

        // // 移除对应的票据项
        // if (ticketItem) {
        //     ticketItem.remove();
        // }

        // // 移除按钮事件监听
        // const closeAlertButton = document.getElementById('closeAlert');
        // if (closeAlertButton && closeAlertButton._closeHandler) {
        //     closeAlertButton.removeEventListener('click', closeAlertButton._closeHandler);
        //     delete closeAlertButton._closeHandler; // 清除记录的事件监听器
        //     console.log('移除了关闭按钮事件监听');
        // }
        setTimeout(() => {
            // 动画结束后再移除票据项
            if (ticketItem) {
                ticketItem.remove();
            }
            // 解绑关闭按钮事件
            const closeAlertButton = document.getElementById('closeAlert');
            if (closeAlertButton && closeAlertButton._closeHandler) {
                closeAlertButton.removeEventListener('click', closeAlertButton._closeHandler);
                delete closeAlertButton._closeHandler;
                console.log('移除了关闭按钮事件监听');
            }
        }, 300);
    },

    /**
     * @param {Ticket} ticket - 票据对象
     * @description 渲染单张电影票到页面。
     * todo: 添加票据
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
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 显示票据详情弹窗。
     */
    showTicketDetail: function (ticketItem) {
        if (!ticketItem) return;
        const modal = document.getElementById('ticketDetailModal');
        const content = document.getElementById('ticketDetailContent');
        if (modal && content) {
            // 获取票据信息
            const movieName = ticketItem.querySelector('h3')?.textContent || '';
            const showTime = ticketItem.querySelector('p:nth-of-type(2)')?.textContent || '';
            const seats = ticketItem.querySelector('p:nth-of-type(3)')?.textContent || '';
            const status = ticketItem.querySelector('.ticket-status')?.textContent || '';
            // 填充内容
            content.innerHTML = `
                <div><strong>${movieName}</strong></div>
                <div>${showTime}</div>
                <div>${seats}</div>
                <div>${status}</div>
            `;
            showModal('ticketDetailModal');
        }
        // 绑定关闭按钮
        const closeBtn = document.getElementById('closeDetailModal');
        if (closeBtn) {
            const closeHandler = function () {
                hideModal('ticketDetailModal');
                content.innerHTML = '';
                closeBtn.removeEventListener('click', closeHandler);
            };
            closeBtn.addEventListener('click', closeHandler);
        }
    },
};

// 事件处理模块
const TicketEvents = {
    /**
     * @param {Event} event - 事件对象
     * @description 处理info按钮点击事件，展示详情弹窗。
     */
    onInfoClick: function (event) {
        if (event.target.classList.contains('info-btn') || (event.target.closest && event.target.closest('.info-btn'))) {
            const btn = event.target.classList.contains('info-btn') ? event.target : event.target.closest('.info-btn');
            const ticketItem = btn.closest('.ticket-item');
            if (ticketItem) {
                TicketUI.showTicketDetail(ticketItem);
            }
        }
    },

    /**
     * @param {Event} event - 事件对象
     * @description 处理退票按钮点击事件。
     */
    onRefundClick: function (event) {
        if (event.target.classList.contains('refund-btn')) { // 检查是否点击了退票按钮
            const ticketItem = event.target.closest('.ticket-item');
            if (ticketItem) {
                TicketUI.showMyAlert('退票成功！', ticketItem);
            }
        }
    },
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
            ticketList.addEventListener('click', TicketEvents.onInfoClick);
        }


        // 示例：添加一张电影票
        const sampleTicket = new Ticket('示例电影', '2025年7月10日 19:00', ['A10', 'A11'], 'unpaid');
        TicketUI.renderTicket(sampleTicket);
    }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    TicketWeb.init();
});


