// 全局变量
let ticketList = null; // 全局票据列表实例

// 数据与类封装
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

// 工具函数模块
const Utils = {
    /**
     * @param {string} modalId - 待显示的弹窗 ID
     * @description 显示弹窗动画。
     */
    showModal: function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // console.log(`[showModal] before:`, modal.className);
            modal.classList.remove('hidden');
            requestAnimationFrame(() => {
                modal.classList.add('show');
                // console.log(`[showModal] after add show:`, modal.className);
            });
        }
    },

    /**
     * @param {string} modalId - 待隐藏的弹窗 ID
     * @description 隐藏弹窗动画。
     */
    hideModal: function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // console.log(`[hideModal] before:`, modal.className);
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
                // console.log(`[hideModal] after add hidden:`, modal.className);
            }, 300);
        }
    },

    /**
     * @param {HTMLElement} pDateString 
     * @returns {Date|null} 返回转换后的日期对象或 null
     * @description 将日期字符串转换为 Date 对象。
     */
    convertDate: function (pDateString) {
        const text = pDateString.innerText || '';
        const matchRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/;
        const match = text.match(matchRegex);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // 月份从0开始
            const day = parseInt(match[3], 10);
            const hour = parseInt(match[4], 10);
            const minute = parseInt(match[5], 10);
            return new Date(year, month, day, hour, minute);
        }
        return null; // 如果没有匹配到日期格式，返回 null
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
            Utils.showModal('customAlert');
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
        Utils.hideModal('customAlert');
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
                    <p>座位: ${ticket.seats}</p>
                    <p class="ticket-status status-${ticket.status}" data-status="${ticket.status}">状态: ${ticket.status === 'unpaid' ? '未付款' : '已付款'}</p>
                </div>
                <div class="btn-box">
                ${ticket.status === 'unpaid' ?
                    `<button class="btn-primary pay-btn">
                        <i class="fas fa-credit-card"></i> 去付款
                    </button>
                    <button class="btn-danger cancel-btn">
                        <i class="fas fa-window-close"></i> 取消预定
                    </button>`
                    :
                    `<button class="btn-primary info-btn">
                        <i class="fas fa-info-circle"></i> 查看详情
                    </button>
                    <button class="btn-danger refund-btn">
                        <i class="fas fa-undo"></i> 退票
                    </button>`
                }
                </div>
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
        const title = document.getElementById('ticketDetailTitle');
        const content = document.getElementById('ticketDetailContent');
        const btnBox = document.getElementById('ticketDetailBtnBox');
        if (modal && content && title && btnBox) {
            // 获取票据信息
            const movieName = ticketItem.querySelector('h3')?.textContent || '';
            const showTime = ticketItem.querySelector('p:nth-of-type(1)')?.textContent || '';
            const seats = ticketItem.querySelector('p:nth-of-type(2)')?.textContent || '';
            const status = ticketItem.querySelector('.ticket-status')?.textContent || '';
            // 填充内容
            title.textContent = '票据详情';
            content.innerHTML = `
                <div><strong>${movieName}</strong></div>
                <div>${showTime}</div>
                <div>${seats}</div>
            `;
            btnBox.innerHTML = `<button id="closeDetailModal" class="btn-secondary">关闭</button>`;
            Utils.showModal('ticketDetailModal');
            // 绑定关闭按钮
            const closeBtn = document.getElementById('closeDetailModal');
            if (closeBtn) {
                const closeHandler = function () {
                    Utils.hideModal('ticketDetailModal');
                    content.innerHTML = '';
                    btnBox.innerHTML = '';
                    closeBtn.removeEventListener('click', closeHandler);
                };
                closeBtn.addEventListener('click', closeHandler);
            }
        }
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 显示付款弹窗，复用详情弹窗结构，仅标题和按钮不同。
     */
    showPayModal: function (ticketItem) {
        if (!ticketItem) return;
        const modal = document.getElementById('ticketDetailModal');
        const title = document.getElementById('ticketDetailTitle');
        const content = document.getElementById('ticketDetailContent');
        const btnBox = document.getElementById('ticketDetailBtnBox');
        if (modal && content && title && btnBox) {
            // 获取票据信息
            const movieName = ticketItem.querySelector('h3')?.textContent || '';
            const showTime = ticketItem.querySelector('p:nth-of-type(1)')?.textContent || '';
            const seats = ticketItem.querySelector('p:nth-of-type(2)')?.textContent || '';
            const status = ticketItem.querySelector('.ticket-status')?.textContent || '';
            // 填充内容
            title.textContent = '确认付款';
            content.innerHTML = `
                <div><strong>${movieName}</strong></div>
                <div>${showTime}</div>
                <div>${seats}</div>
            `;
            btnBox.innerHTML = `
                <button id="payModalPayBtn" class="btn-primary topay-btn">去付款</button>
                <button id="closeDetailModal" class="btn-secondary">关闭</button>
            `;
            Utils.showModal('ticketDetailModal');
            // 绑定去付款按钮
            const payBtn = document.getElementById('payModalPayBtn');
            if (payBtn) {
                const payHandler = function () {
                    Utils.hideModal('ticketDetailModal');
                    setTimeout(() => {
                        // 弹出付款成功提示框
                        TicketUI.showPaySuccessAlert(ticketItem);
                    }, 300);
                    payBtn.removeEventListener('click', payHandler);
                };
                payBtn.addEventListener('click', payHandler);
            }
        }
        // 绑定关闭按钮
        const closeBtn = document.getElementById('closeDetailModal');
        if (closeBtn) {
            const closeHandler = function () {
                Utils.hideModal('ticketDetailModal');
                content.innerHTML = '';
                closeBtn.removeEventListener('click', closeHandler);
            };
            closeBtn.addEventListener('click', closeHandler);
        }
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 显示退票确认弹窗。
     */
    showRefundConfirm: function (ticketItem) {
        if (!ticketItem) return;
        const modal = document.getElementById('confirmRefundModal');
        const content = document.getElementById('confirmRefundContent');
        if (modal && content) {
            // 复用详情内容
            const movieName = ticketItem.querySelector('h3')?.textContent || '';
            const showTime = ticketItem.querySelector('p:nth-of-type(1)')?.textContent || '';
            const seats = ticketItem.querySelector('p:nth-of-type(2)')?.textContent || '';
            const status = ticketItem.querySelector('.ticket-status')?.textContent || '';
            content.innerHTML = `
                <div><strong>${movieName}</strong></div>
                <div>${showTime}</div>
                <div>${seats}</div>
            `;
            Utils.showModal('confirmRefundModal');
        }
        // 绑定按钮事件
        const confirmBtn = document.getElementById('confirmRefundBtn');
        const cancelBtn = document.getElementById('cancelRefundBtn');
        // 先解绑，防止多次绑定
        if (confirmBtn._handler) confirmBtn.removeEventListener('click', confirmBtn._handler);
        if (cancelBtn._handler) cancelBtn.removeEventListener('click', cancelBtn._handler);
        // 确认退票
        const confirmHandler = () => {
            Utils.hideModal('confirmRefundModal');
            setTimeout(() => {
                TicketUI.showMyAlert('退票成功！', ticketItem);
            }, 300);
        };
        // 取消退票
        const cancelHandler = () => {
            Utils.hideModal('confirmRefundModal');
        };
        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);
        confirmBtn._handler = confirmHandler;
        cancelBtn._handler = cancelHandler;
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 显示取消预订确认弹窗。
     */
    showCancelConfirm: function (ticketItem) {
        if (!ticketItem) return;
        const modal = document.getElementById('confirmCancelModal');
        const content = document.getElementById('confirmCancelContent');
        if (modal && content) {
            // 复用详情内容
            const movieName = ticketItem.querySelector('h3')?.textContent || '';
            const showTime = ticketItem.querySelector('p:nth-of-type(1)')?.textContent || '';
            const seats = ticketItem.querySelector('p:nth-of-type(2)')?.textContent || '';
            const status = ticketItem.querySelector('.ticket-status')?.textContent || '';
            content.innerHTML = `
                <div><strong>${movieName}</strong></div>
                <div>${showTime}</div>
                <div>${seats}</div>
            `;
            Utils.showModal('confirmCancelModal');
        }
        // 绑定按钮事件
        const confirmBtn = document.getElementById('confirmCancelBtn');
        const cancelBtn = document.getElementById('cancelCancelBtn');
        // 先解绑，防止多次绑定
        if (confirmBtn._handler) confirmBtn.removeEventListener('click', confirmBtn._handler);
        if (cancelBtn._handler) cancelBtn.removeEventListener('click', cancelBtn._handler);
        // 确认取消
        const confirmHandler = () => {
            Utils.hideModal('confirmCancelModal');
            setTimeout(() => {
                TicketUI.showMyAlert('取消预订成功！', ticketItem);
            }, 300);
        };
        // 返回
        const cancelHandler = () => {
            Utils.hideModal('confirmCancelModal');
        };
        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);
        confirmBtn._handler = confirmHandler;
        cancelBtn._handler = cancelHandler;
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 将票据项转为已付款状态
     */
    convertToPaidTicketItem: function (ticketItem) {
        if (!ticketItem) return;
        // 修改状态
        const statusElem = ticketItem.querySelector('.ticket-status');
        if (statusElem) {
            statusElem.textContent = '状态: 已付款';
            statusElem.classList.remove('status-unpaid');
            statusElem.classList.add('status-paid');
            statusElem.setAttribute('data-status', 'paid');
        }
        // 修改按钮区
        const btnBox = ticketItem.querySelector('.btn-box');
        if (btnBox) {
            btnBox.innerHTML = `
                <button class="btn-primary info-btn">
                    <i class="fas fa-info-circle"></i> 查看详情
                </button>
                <button class="btn-danger refund-btn">
                    <i class="fas fa-undo"></i> 退票
                </button>
            `;
        }
    },

    /**
     * @param {HTMLElement} ticketList - 票据列表元素
     * @description 对票据列表进行排序，按放映时间升序排列。
     */
    sortTickets: function (ticketList) {
        if (!ticketList) return;
        // 获取所有票据项
        const tickets = Array.from(ticketList.querySelectorAll('.ticket-item'));
        // 按放映时间升序排序
        const sortedTickets = tickets.sort((a, b) => {
            return Utils.convertDate(a.querySelector('.ticket-info p:nth-of-type(1)')) -
                Utils.convertDate(b.querySelector('.ticket-info p:nth-of-type(1)'));
        });
        // console.log('[sortTickets] sortedTickets:', sortedTickets);
        // 重新渲染
        ticketList.innerHTML = '';
        sortedTickets.forEach(ticket => ticketList.appendChild(ticket));
    },

    /**
     * @param {HTMLElement} ticketItem - 票据项元素
     * @description 显示付款成功提示框，关闭时转为已付款状态。
     */
    showPaySuccessAlert: function (ticketItem) {
        const modal = document.getElementById('customAlert');
        const alertMessage = document.getElementById('alertMessage');
        if (modal && alertMessage) {
            alertMessage.textContent = '付款成功！';
            Utils.showModal('customAlert');
        }
        // 绑定关闭按钮
        const closeAlertButton = document.getElementById('closeAlert');
        if (closeAlertButton) {
            const closeHandler = function () {
                Utils.hideModal('customAlert');
                setTimeout(() => {
                    TicketUI.convertToPaidTicketItem(ticketItem);
                }, 300);
                closeAlertButton.removeEventListener('click', closeHandler);
            };
            closeAlertButton.addEventListener('click', closeHandler);
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
                TicketUI.showRefundConfirm(ticketItem);
            }
        }
    },

    /**
     * @param {Event} event - 事件对象
     * @description 处理去付款按钮点击事件，弹出付款弹窗。
     */
    onPayClick: function (event) {
        if (event.target.classList.contains('pay-btn') || (event.target.closest && event.target.closest('.pay-btn'))) {
            const btn = event.target.classList.contains('pay-btn') ? event.target : event.target.closest('.pay-btn');
            const ticketItem = btn.closest('.ticket-item');
            if (ticketItem) {
                TicketUI.showPayModal(ticketItem);
            }
        }
    },

    /** 
     * @param {Event} event - 事件对象
     * @description 处理取消预订按钮点击事件。
     */
    onCancelClick: function (event) {
        if (event.target.classList.contains('cancel-btn')) { // 检查是否点击了取消预订按钮
            const ticketItem = event.target.closest('.ticket-item');
            if (ticketItem) {
                TicketUI.showCancelConfirm(ticketItem);
            }
        }
    },

    /**
     * @param {Event} event - 事件对象
     * @description 处理返回首页按钮点击事件。
     */
    onBackClick: function (event) {
        console.log('[onBackClick] event:', event);
        if (event.target.id === 'backToHome') {

            ticketList.storeTickets(); // 存储当前票据列表到 sessionStorage

            console.log('[onBackClick] ticketList:', ticketList);

            console.log('sessionStorage:', JSON.stringify(sessionStorage));
            // debugger;
            // 返回首页逻辑
            window.location.href = 'index.html';
        }
    }
};

// 初始化模块
const TicketWeb = {
    /**
     * @description 初始化票夹页面。
     */
    init: function () {
        console.log('sessionStorage:', JSON.stringify(sessionStorage));
        // debugger;

        const backToHomeButton = document.getElementById('backToHome');
        // 绑定返回首页按钮事件
        if (backToHomeButton) {
            backToHomeButton.addEventListener('click', TicketEvents.onBackClick);
        }

        // 获取票据列表HTML元素
        const ticketListElem = document.getElementById('ticketList');
        // 增加按钮事件
        if (ticketListElem) {
            ticketListElem.addEventListener('click', TicketEvents.onRefundClick);
            ticketListElem.addEventListener('click', TicketEvents.onInfoClick);
            ticketListElem.addEventListener('click', TicketEvents.onPayClick);
            ticketListElem.addEventListener('click', TicketEvents.onCancelClick);
        }

        // 初始化票据列表
        ticketList = new TicketList(); // 全局票据列表实例
        // 从 sessionStorage 中拉取票据数据
        ticketList.pullTickets();
        // 渲染所有票据
        ticketList.tickets.forEach(ticket => {
            TicketUI.renderTicket(ticket);
        });

        // 示例增加几张票据
        // TicketUI.renderTicket(new Ticket('电影A', '2023年10月1日 14:30', ['A1', 'A2'], 'unpaid'));

        TicketUI.sortTickets(ticketListElem);
    }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    TicketWeb.init();
});


