const { createApp, ref } = Vue
const { ElMessage } = ElementPlus

createApp({
    setup() {
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
        const cards = ref([])

        // 重置额外字段
        const resetAdditionalFields = () => {
            cardForm.value.gracePeriod = null
            cardForm.value.fixedRepaymentDay = null
        }

        // 添加信用卡
        const addCard = () => {
            // 验证表单
            if (!cardForm.value.name || !cardForm.value.bank || !cardForm.value.billDay || !cardForm.value.billMode) {
                ElMessage.error('请填写完整信用卡信息')
                return
            }

            // 根据还款模式验证
            if (cardForm.value.billMode === 'grace' && !cardForm.value.gracePeriod) {
                ElMessage.error('请填写宽限期天数')
                return
            }

            if (cardForm.value.billMode === 'fixed' && !cardForm.value.fixedRepaymentDay) {
                ElMessage.error('请填写固定还款日')
                return
            }

            // 添加到列表
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
            const index = cards.value.findIndex(c => c === card)
            if (index !== -1) {
                cards.value.splice(index, 1)
                ElMessage.success('信用卡删除成功')
            }
        }

        // 编辑信用卡
        const editCard = (card) => {
            // 创建编辑对话框
            ElMessageBox.confirm(
                '是否确认编辑此信用卡？', 
                '编辑信用卡', 
                {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(() => {
                // 弹出编辑表单
                const editForm = ref({ ...card })
                
                const editDialog = ElMessageBox({
                    title: '编辑信用卡',
                    message: h('div', { style: 'width: 400px;' }, [
                        h(ElForm, { model: editForm.value }, [
                            h(ElFormItem, { label: '持卡人姓名' }, () => 
                                h(ElInput, { 
                                    modelValue: editForm.value.name,
                                    'onUpdate:modelValue': (val) => editForm.value.name = val,
                                    placeholder: '请输入持卡人姓名' 
                                })
                            ),
                            h(ElFormItem, { label: '发卡银行' }, () => 
                                h(ElSelect, { 
                                    modelValue: editForm.value.bank,
                                    'onUpdate:modelValue': (val) => editForm.value.bank = val,
                                    placeholder: '请选择发卡银行' 
                                }, () => banks.value.map(bank => 
                                    h(ElOption, { label: bank, value: bank })
                                ))
                            ),
                            h(ElFormItem, { label: '账单日' }, () => 
                                h(ElInputNumber, { 
                                    modelValue: editForm.value.billDay,
                                    'onUpdate:modelValue': (val) => editForm.value.billDay = val,
                                    min: 1,
                                    max: 31,
                                    placeholder: '请输入账单日' 
                                })
                            )
                        ])
                    ]),
                    showCancelButton: true,
                    confirmButtonText: '保存',
                    cancelButtonText: '取消',
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            // 验证表单
                            if (!editForm.value.name || !editForm.value.bank || !editForm.value.billDay) {
                                ElMessage.error('请填写完整信用卡信息')
                                return
                            }
                            
                            // 更新卡片信息
                            const index = cards.value.findIndex(c => c === card)
                            if (index !== -1) {
                                cards.value.splice(index, 1, editForm.value)
                                ElMessage.success('信用卡编辑成功')
                            }
                            done()
                        } else {
                            done()
                        }
                    }
                })
            }).catch(() => {
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
})
