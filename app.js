const { createApp, ref, watch } = Vue
const { ElMessage, ElMessageBox } = ElementPlus
createApp({
    setup() {
        // 加载保存的数据
        const loadCards = () => {
            const savedCards = localStorage.getItem('credit-cards')
            return savedCards ? JSON.parse(savedCards) : []
        }
        // 银行列表
        const banks = ref([
            '工商银行', '建设银行', '农业银行', 
            '中国银行', '交通银行', '招商银行', 
            '平安银行', '邮政银行', '光大银行'
        ])
        // 信用卡表单初始数据
        const cardForm = ref({
            name: '',
            bank: '',
            billDay: null,
            billMode: '',
            gracePeriod: null,
            fixedRepaymentDay: null,
            billCycle: 'current'
        })
        // 信用卡列表
        const cards = ref(loadCards())
        // 监听cards变化并保存
        watch(cards, (newCards) => {
            localStorage.setItem('credit-cards', JSON.stringify(newCards))
        }, { deep: true })
        // 表单验证
        const validateForm = () => {
            if (!cardForm.value.name || !cardForm.value.bank || !cardForm.value.billDay || !cardForm.value.billMode) {
                ElMessage.error('请填写完整信用卡信息')
                return false
            }
            if (cardForm.value.billMode === 'grace' && !cardForm.value.gracePeriod) {
                ElMessage.error('请填写宽限期天数')
                return false
            }
            if (cardForm.value.billMode === 'fixed' && !cardForm.value.fixedRepaymentDay) {
                ElMessage.error('请填写固定还款日')
                return false
            }
            return true
        }
        // 重置额外字段
        const resetAdditionalFields = () => {
            cardForm.value.gracePeriod = null
            cardForm.value.fixedRepaymentDay = null
        }
        // 添加信用卡
        const addCard = () => {
            if (!validateForm()) return
            cards.value.push({ ...cardForm.value })
            // 重置表单
            cardForm.value = {
                name: '',
                bank: '',
                billDay: null,
                billMode: '',
                gracePeriod: null,
                fixedRepaymentDay: null,
                billCycle: 'current'
            }
            ElMessage.success('信用卡添加成功')
        }
        // 删除信用卡
        const deleteCard = (card) => {
            ElMessageBox.confirm(
                '确定要删除这张信用卡吗？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
            .then(() => {
                const index = cards.value.findIndex(c => c === card)
                if (index !== -1) {
                    cards.value.splice(index, 1)
                    ElMessage.success('信用卡删除成功')
                }
            })
            .catch(() => {
                ElMessage.info('已取消删除')
            })
        }
        // 编辑信用卡
        const editCard = (card) => {
            const index = cards.value.findIndex(c => c === card)
            cardForm.value = { ...card }
            ElMessageBox.confirm(
                '确认要编辑这张信用卡吗？',
                '编辑信用卡',
                {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
            .then(() => {
                if (!validateForm()) return
                cards.value[index] = { ...cardForm.value }
                ElMessage.success('信用卡编辑成功')
                // 重置表单
                cardForm.value = {
                    name: '',
                    bank: '',
                    billDay: null,
                    billMode: '',
                    gracePeriod: null,
                    fixedRepaymentDay: null,
                    billCycle: 'current'
                }
            })
            .catch(() => {
                ElMessage.info('已取消编辑')
            })
        }
        return {
            banks,
            cardForm,
            cards,
            resetAdditionalFields,
            addCard,
            deleteCard,
            editCard
        }
    }
}).use(ElementPlus).mount('#app')
