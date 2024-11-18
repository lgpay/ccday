const { createApp, ref, onMounted } = Vue

createApp({
    setup() {
        // 响应式数据
        const cardForm = ref({
            name: '',
            bank: '',
            billDay: 15
        })

        const cards = ref([])
        
        const banks = [
            '工商银行', 
            '建设银行', 
            '农业银行', 
            '中国银行', 
            '交通银行'
        ]

        // 添加信用卡
        const addCard = () => {
            if (!cardForm.value.name || !cardForm.value.bank) {
                ElMessage.error('请填写完整信息')
                return
            }

            cards.value.push({...cardForm.value})
            
            // 保存到localStorage
            localStorage.setItem('creditCards', JSON.stringify(cards.value))

            // 重置表单
            cardForm.value = {
                name: '',
                bank: '',
                billDay: 15
            }
        }

        // 删除信用卡
        const deleteCard = (index) => {
            cards.value.splice(index, 1)
            localStorage.setItem('creditCards', JSON.stringify(cards.value))
        }

        // 页面加载时读取本地存储
        onMounted(() => {
            const savedCards = localStorage.getItem('creditCards')
            if (savedCards) {
                cards.value = JSON.parse(savedCards)
            }
        })

        return {
            cardForm,
            cards,
            banks,
            addCard,
            deleteCard
        }
    }
}).use(ElementPlus).mount('#app')
