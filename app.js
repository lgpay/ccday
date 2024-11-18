const { createApp, ref, onMounted } = Vue

createApp({
    setup() {
        // 银行列表
        const banks = [
            '工商银行', '建设银行', '农业银行', 
            '中国银行', '交通银行', '招商银行', 
            '浦发银行', '民生银行'
        ]

        // 响应式数据 - 表单
        const cardForm = ref({
            name: '',
            bank: '',
            billDay: 15,
            billMode: '', 
            gracePeriod: null, 
            fixedRepaymentDay: null
        })

        // 信用卡列表
        const cards = ref([])

        // 计算还款日期
        const calculateRepaymentDate = (billDay, billMode, gracePeriod, fixedRepaymentDay) => {
            const today = new Date()
            const currentMonth = today.getMonth()
            const currentYear = today.getFullYear()

            // 计算账单日
            const billDate = new Date(currentYear, currentMonth, billDay)

            let repaymentDate
            if (billMode === 'grace') {
                // 固定宽限期模式
                repaymentDate = new Date(billDate)
                repaymentDate.setDate(repaymentDate.getDate() + gracePeriod)
            } else {
                // 固定还款日模式
                repaymentDate = new Date(currentYear, currentMonth, fixedRepaymentDay)
                
                // 如果固定还款日早于账单日，则在下个月
                if (repaymentDate < billDate) {
                    repaymentDate.setMonth(currentMonth + 1)
                }
            }

            return repaymentDate
        }

        // 计算免息天数
        const calculateInterestFreeDays = (billDay, billMode, gracePeriod, fixedRepaymentDay) => {
            const today = new Date()
            const repaymentDate = calculateRepaymentDate(
                billDay, 
                billMode, 
                gracePeriod, 
                fixedRepaymentDay
            )

            // 计算今天到还款日的天数
            const timeDiff = repaymentDate.getTime() - today.getTime()
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

            return daysDiff
        }

        // 计算卡片详细信息
        const calculateCardDetails = (card) => {
            const interestFreeDays = calculateInterestFreeDays(
                card.billDay, 
                card.billMode, 
                card.gracePeriod, 
                card.fixedRepaymentDay
            )

            const repaymentDate = calculateRepaymentDate(
                card.billDay, 
                card.billMode, 
                card.gracePeriod, 
                card.fixedRepaymentDay
            )

            return {
                ...card,
                interestFreeDays: interestFreeDays,
                repaymentDate: repaymentDate.toLocaleDateString()
            }
        }

        // 添加信用卡
        const addCard = () => {
            // 验证表单
            if (!cardForm.value.name || !cardForm.value.bank || !cardForm.value.billDay || !cardForm.value.billMode) {
                ElementPlus.ElMessage.error('请填写完整信用卡信息')
                return
            }

            // 根据账单模式验证额外字段
            if (cardForm.value.billMode === 'grace' && !cardForm.value.gracePeriod) {
                ElementPlus.ElMessage.error('请填写宽限期天数')
                return
            }

            if (cardForm.value.billMode === 'fixed' && !cardForm.value.fixedRepaymentDay) {
                ElementPlus.ElMessage.error('请填写固定还款日')
                return
            }

            // 添加卡片并计算详细信息
            const newCard = calculateCardDetails({...cardForm.value})
            cards.value.push(newCard)

            // 重置表单
            cardForm.value = {
                name: '',
                bank: '',
                billDay: 15,
                billMode: '', 
                gracePeriod: null, 
                fixedRepaymentDay: null
            }

            // 保存到本地存储
            localStorage.setItem('creditCards', JSON.stringify(cards.value))
        }

        // 删除信用卡
        const deleteCard = (index) => {
            cards.value.splice(index, 1)
            // 更新本地存储
            localStorage.setItem('creditCards', JSON.stringify(cards.value))
        }

        // 页面加载时从本地存储恢复数据
        onMounted(() => {
            const savedCards = localStorage.getItem('creditCards')
            if (savedCards) {
                cards.value = JSON.parse(savedCards)
            }
        })

        return {
            banks,
            cardForm,
            cards,
            addCard,
            deleteCard
        }
    }
}).use(ElementPlus).mount('#app')
