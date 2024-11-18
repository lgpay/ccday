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
            fixedRepaymentDay: null,
            billCycle: 'current'
        })

        // 重置额外字段
        const resetAdditionalFields = () => {
            cardForm.value.gracePeriod = null
            cardForm.value.fixedRepaymentDay = null
        }

        // 信用卡列表
        const cards = ref([])

        // 计算还款日期的增强版本
        const calculateRepaymentDate = (billDay, billMode, gracePeriod, fixedRepaymentDay, billCycle) => {
            const today = new Date()
            const currentMonth = today.getMonth()
            const currentYear = today.getFullYear()
            const currentDate = today.getDate()

            // 计算账单日
            const billDate = new Date(currentYear, currentMonth, billDay)

            let repaymentDate
            // 判断今天是否已经过了账单日
            const isAfterBillDay = currentDate > billDay

            if (billMode === 'grace') {
                // 固定宽限期模式
                if (isAfterBillDay) {
                    // 如果今天已过账单日，还款日在下个月
                    repaymentDate = new Date(currentYear, currentMonth + 1, billDay)
                    repaymentDate.setDate(repaymentDate.getDate() + gracePeriod)
                } else {
                    // 如果今天未过账单日，还款日在本月
                    repaymentDate = new Date(billDate)
                    repaymentDate.setDate(repaymentDate.getDate() + gracePeriod)
                }
            } else {
                // 固定还款日模式
                repaymentDate = new Date(currentYear, currentMonth, fixedRepaymentDay)
                
                // 如果固定还款日早于当前日期，则在下个月
                if (repaymentDate < today) {
                    repaymentDate.setMonth(currentMonth + 1)
                }
            }

            return repaymentDate
        }

        // 计算免息天数的增强版本
        const calculateInterestFreeDays = (billDay, billMode, gracePeriod, fixedRepaymentDay, billCycle) => {
            const today = new Date()
            const currentDate = today.getDate()
            const currentMonth = today.getMonth()
            const currentYear = today.getFullYear()

            // 判断今天是否已经过了账单日
            const isAfterBillDay = currentDate > billDay

            let startDate, endDate

            if (billCycle === 'current') {
                // 本期账单模式：今天在账单日之前，免息期从今天到还款日
                if (!isAfterBillDay) {
                    startDate = today
                    endDate = calculateRepaymentDate(
                        billDay, 
                        billMode, 
                        gracePeriod, 
                        fixedRepaymentDay,
                        billCycle
                    )
                } else {
                    // 今天在账单日之后，免息期从下个账单日开始
                    startDate = new Date(currentYear, currentMonth + 1, billDay)
                    endDate = calculateRepaymentDate(
                        billDay, 
                        billMode, 
                        gracePeriod, 
                        fixedRepaymentDay,
                        billCycle
                    )
                }
            } else {
                // 下期账单模式：无论今天是否过账单日，免息期都从下个账单日开始
                startDate = new Date(currentYear, currentMonth + 1, billDay)
                endDate = calculateRepaymentDate(
                    billDay, 
                    billMode, 
                    gracePeriod, 
                    fixedRepaymentDay,
                    billCycle
                )
            }

            // 计算免息天数
            const timeDiff = endDate.getTime() - startDate.getTime()
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

            return daysDiff > 0 ? daysDiff : 0
        }

        // 计算卡片详细信息
        const calculateCardDetails = (card) => {
            const interestFreeDays = calculateInterestFreeDays(
                card.billDay, 
                card.billMode, 
                card.gracePeriod, 
                card.fixedRepaymentDay,
                card.billCycle
            )

            const repaymentDate = calculateRepaymentDate(
                card.billDay, 
                card.billMode, 
                card.gracePeriod, 
                card.fixedRepaymentDay,
                card.billCycle
            )

            return {
                ...card,
                interestFreeDays: interestFreeDays,
                repaymentDate: repaymentDate.toLocaleDateString()
            }
        }

        // 添加信用卡
        const addCard = () => {
            // 表单验证
            if (!cardForm.value.name || !cardForm.value.bank || !cardForm.value.billMode) {
                ElementPlus.ElMessage.error('请填写完整信用卡信息')
                return
            }

            // 根据还款模式验证额外字段
            if (cardForm.value.billMode === 'grace' && !cardForm.value.gracePeriod) {
                ElementPlus.ElMessage.error('请填写宽限期天数')
                return
            }

            if (cardForm.value.billMode === 'fixed' && !cardForm.value.fixedRepaymentDay) {
                ElementPlus.ElMessage.error('请填写固定还款日')
                return
            }

            // 计算并添加新卡
            const newCard = calculateCardDetails(cardForm.value)
            cards.value.push(newCard)

            // 重置表单
            cardForm.value = {
                name: '',
                bank: '',
                billDay: 15,
                billMode: '', 
                gracePeriod: null, 
                fixedRepaymentDay: null,
                billCycle: 'current'
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

        // 组件挂载时加载本地存储的信用卡
        onMounted(() => {
            const storedCards = localStorage.getItem('creditCards')
            if (storedCards) {
                cards.value = JSON.parse(storedCards)
            }
        })

        return {
            banks,
            cardForm,
            cards,
            resetAdditionalFields,
            addCard,
            deleteCard
        }
    }
}).use(ElementPlus).mount('#app')
