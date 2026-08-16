const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');

const translations = {
  en: {
    dashboard: "Dashboard", expenses: "Expenses", incomes: "Incomes", savings: "Savings", settings: "Settings", language: "Language", logout: "Logout",
    totalBalance: "Total Balance", totalExpenses: "Total Expenses", totalIncome: "Total Income",
    recentTransactions: "Recent Transactions", noTransactionsFound: "No transactions found", topSpendingCategories: "Top Spending Categories",
    loadingData: "Loading data...", failedToLoad: "Failed to load data",
    addNewExpense: "Add New Expense", category: "Category", amount: "Amount", date: "Date", merchant: "Merchant", notes: "Notes", actions: "Actions", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", updateExpense: "Update Expense", filter: "Filter", noExpensesFound: "No expenses found",
    addNewIncome: "Add New Income", source: "Source", updateIncome: "Update Income", noIncomesFound: "No incomes found",
    targetAmount: "Target Amount", setGoal: "Set Goal", editGoal: "Edit Goal", currentSavings: "Current Savings", goalProgress: "Goal Progress", deleteGoal: "Delete Goal", monthlySavingsTrend: "Monthly Savings Trend",
    profileSettings: "Profile Settings", name: "Name", email: "Email", age: "Age", gender: "Gender", occupation: "Occupation", currency: "Currency", primarySourceOfIncome: "Primary Source of Income", aiConsent: "AI Consent", saveChanges: "Save Changes", uploadPicture: "Upload Picture", removePicture: "Remove Picture"
  },
  hi: {
    dashboard: "डैशबोर्ड", expenses: "खर्च", incomes: "आय", savings: "बचत", settings: "सेटिंग्स", language: "भाषा", logout: "लॉग आउट",
    totalBalance: "कुल शेष", totalExpenses: "कुल खर्च", totalIncome: "कुल आय",
    recentTransactions: "हाल के लेनदेन", noTransactionsFound: "कोई लेनदेन नहीं मिला", topSpendingCategories: "शीर्ष खर्च श्रेणियां",
    loadingData: "डेटा लोड हो रहा है...", failedToLoad: "डेटा लोड करने में विफल",
    addNewExpense: "नया खर्च जोड़ें", category: "श्रेणी", amount: "राशि", date: "तारीख", merchant: "व्यापारी", notes: "नोट्स", actions: "कार्रवाइयां", edit: "संपादित करें", delete: "हटाएं", save: "सहेजें", cancel: "रद्द करें", updateExpense: "खर्च अपडेट करें", filter: "फ़िल्टर", noExpensesFound: "कोई खर्च नहीं मिला",
    addNewIncome: "नई आय जोड़ें", source: "स्रोत", updateIncome: "आय अपडेट करें", noIncomesFound: "कोई आय नहीं मिली",
    targetAmount: "लक्ष्य राशि", setGoal: "लक्ष्य निर्धारित करें", editGoal: "लक्ष्य संपादित करें", currentSavings: "वर्तमान बचत", goalProgress: "लक्ष्य प्रगति", deleteGoal: "लक्ष्य हटाएं", monthlySavingsTrend: "मासिक बचत प्रवृत्ति",
    profileSettings: "प्रोफ़ाइल सेटिंग्स", name: "नाम", email: "ईमेल", age: "आयु", gender: "लिंग", occupation: "पेशा", currency: "मुद्रा", primarySourceOfIncome: "आय का प्राथमिक स्रोत", aiConsent: "एआई सहमति", saveChanges: "परिवर्तन सहेजें", uploadPicture: "तस्वीर अपलोड करें", removePicture: "तस्वीर हटाएं"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", expenses: "খরচ", incomes: "আয়", savings: "সঞ্চয়", settings: "সেটিংস", language: "ভাষা", logout: "লগ আউট",
    totalBalance: "মোট ব্যালেন্স", totalExpenses: "মোট খরচ", totalIncome: "মোট আয়",
    recentTransactions: "সাম্প্রতিক লেনদেন", noTransactionsFound: "কোনো লেনদেন পাওয়া যায়নি", topSpendingCategories: "শীর্ষ ব্যয়ের বিভাগগুলি",
    loadingData: "ডেটা লোড হচ্ছে...", failedToLoad: "ডেটা লোড করতে ব্যর্থ",
    addNewExpense: "নতুন খরচ যোগ করুন", category: "বিভাগ", amount: "পরিমাণ", date: "তারিখ", merchant: "ব্যবসায়ী", notes: "নোট", actions: "ক্রিয়া", edit: "সম্পাদনা", delete: "মুছুন", save: "সংরক্ষণ করুন", cancel: "বাতিল করুন", updateExpense: "খরচ আপডেট করুন", filter: "ফিল্টার", noExpensesFound: "কোনো খরচ পাওয়া যায়নি",
    addNewIncome: "নতুন আয় যোগ করুন", source: "উৎস", updateIncome: "আয় আপডেট করুন", noIncomesFound: "কোনো আয় পাওয়া যায়নি",
    targetAmount: "লক্ষ্যের পরিমাণ", setGoal: "লক্ষ্য নির্ধারণ করুন", editGoal: "লক্ষ্য সম্পাদনা করুন", currentSavings: "বর্তমান সঞ্চয়", goalProgress: "লক্ষ্যের অগ্রগতি", deleteGoal: "লক্ষ্য মুছুন", monthlySavingsTrend: "মাসিক সঞ্চয় প্রবণতা",
    profileSettings: "প্রোফাইল সেটিংস", name: "নাম", email: "ইমেল", age: "বয়স", gender: "লিঙ্গ", occupation: "পেশা", currency: "মুদ্রা", primarySourceOfIncome: "আয়ের প্রাথমিক উৎস", aiConsent: "এআই সম্মতি", saveChanges: "পরিবর্তন সংরক্ষণ করুন", uploadPicture: "ছবি আপলোড করুন", removePicture: "ছবি মুছুন"
  },
  es: {
    dashboard: "Panel", expenses: "Gastos", incomes: "Ingresos", savings: "Ahorros", settings: "Ajustes", language: "Idioma", logout: "Cerrar sesión",
    totalBalance: "Saldo Total", totalExpenses: "Gastos Totales", totalIncome: "Ingresos Totales",
    recentTransactions: "Transacciones Recientes", noTransactionsFound: "No se encontraron transacciones", topSpendingCategories: "Principales categorías de gasto",
    loadingData: "Cargando datos...", failedToLoad: "Error al cargar los datos",
    addNewExpense: "Añadir Nuevo Gasto", category: "Categoría", amount: "Cantidad", date: "Fecha", merchant: "Comerciante", notes: "Notas", actions: "Acciones", edit: "Editar", delete: "Eliminar", save: "Guardar", cancel: "Cancelar", updateExpense: "Actualizar Gasto", filter: "Filtrar", noExpensesFound: "No se encontraron gastos",
    addNewIncome: "Añadir Nuevo Ingreso", source: "Fuente", updateIncome: "Actualizar Ingreso", noIncomesFound: "No se encontraron ingresos",
    targetAmount: "Cantidad Objetivo", setGoal: "Establecer Meta", editGoal: "Editar Meta", currentSavings: "Ahorros Actuales", goalProgress: "Progreso de la Meta", deleteGoal: "Eliminar Meta", monthlySavingsTrend: "Tendencia de Ahorro Mensual",
    profileSettings: "Configuración de Perfil", name: "Nombre", email: "Correo Electrónico", age: "Edad", gender: "Género", occupation: "Ocupación", currency: "Moneda", primarySourceOfIncome: "Fuente de ingresos principal", aiConsent: "Consentimiento de IA", saveChanges: "Guardar Cambios", uploadPicture: "Subir Foto", removePicture: "Eliminar Foto"
  },
  pt: {
    dashboard: "Painel", expenses: "Despesas", incomes: "Receitas", savings: "Poupança", settings: "Configurações", language: "Idioma", logout: "Sair",
    totalBalance: "Saldo Total", totalExpenses: "Despesas Totais", totalIncome: "Receita Total",
    recentTransactions: "Transações Recentes", noTransactionsFound: "Nenhuma transação encontrada", topSpendingCategories: "Principais Categorias de Gastos",
    loadingData: "Carregando dados...", failedToLoad: "Falha ao carregar os dados",
    addNewExpense: "Adicionar Nova Despesa", category: "Categoria", amount: "Valor", date: "Data", merchant: "Comerciante", notes: "Notas", actions: "Ações", edit: "Editar", delete: "Excluir", save: "Salvar", cancel: "Cancelar", updateExpense: "Atualizar Despesa", filter: "Filtrar", noExpensesFound: "Nenhuma despesa encontrada",
    addNewIncome: "Adicionar Nova Receita", source: "Fonte", updateIncome: "Atualizar Receita", noIncomesFound: "Nenhuma receita encontrada",
    targetAmount: "Valor Alvo", setGoal: "Definir Meta", editGoal: "Editar Meta", currentSavings: "Poupança Atual", goalProgress: "Progresso da Meta", deleteGoal: "Excluir Meta", monthlySavingsTrend: "Tendência de Poupança Mensal",
    profileSettings: "Configurações de Perfil", name: "Nome", email: "E-mail", age: "Idade", gender: "Gênero", occupation: "Ocupação", currency: "Moeda", primarySourceOfIncome: "Principal Fonte de Renda", aiConsent: "Consentimento de IA", saveChanges: "Salvar Alterações", uploadPicture: "Enviar Foto", removePicture: "Remover Foto"
  },
  ja: {
    dashboard: "ダッシュボード", expenses: "支出", incomes: "収入", savings: "貯金", settings: "設定", language: "言語", logout: "ログアウト",
    totalBalance: "総残高", totalExpenses: "総支出", totalIncome: "総収入",
    recentTransactions: "最近の取引", noTransactionsFound: "取引が見つかりません", topSpendingCategories: "上位の支出カテゴリ",
    loadingData: "データを読み込んでいます...", failedToLoad: "データの読み込みに失敗しました",
    addNewExpense: "新しい支出を追加", category: "カテゴリ", amount: "金額", date: "日付", merchant: "店", notes: "メモ", actions: "操作", edit: "編集", delete: "削除", save: "保存", cancel: "キャンセル", updateExpense: "支出を更新", filter: "フィルター", noExpensesFound: "支出が見つかりません",
    addNewIncome: "新しい収入を追加", source: "ソース", updateIncome: "収入を更新", noIncomesFound: "収入が見つかりません",
    targetAmount: "目標額", setGoal: "目標を設定", editGoal: "目標を編集", currentSavings: "現在の貯金", goalProgress: "目標の進捗", deleteGoal: "目標を削除", monthlySavingsTrend: "月間貯金トレンド",
    profileSettings: "プロフィール設定", name: "名前", email: "メール", age: "年齢", gender: "性別", occupation: "職業", currency: "通貨", primarySourceOfIncome: "主な収入源", aiConsent: "AI 同意", saveChanges: "変更を保存", uploadPicture: "写真をアップロード", removePicture: "写真を削除"
  },
  ko: {
    dashboard: "대시보드", expenses: "지출", incomes: "수입", savings: "저축", settings: "설정", language: "언어", logout: "로그아웃",
    totalBalance: "총 잔액", totalExpenses: "총 지출", totalIncome: "총 수입",
    recentTransactions: "최근 거래", noTransactionsFound: "거래가 없습니다", topSpendingCategories: "상위 지출 카테고리",
    loadingData: "데이터를 불러오는 중...", failedToLoad: "데이터 불러오기 실패",
    addNewExpense: "새 지출 추가", category: "카테고리", amount: "금액", date: "날짜", merchant: "가맹점", notes: "메모", actions: "작업", edit: "편집", delete: "삭제", save: "저장", cancel: "취소", updateExpense: "지출 업데이트", filter: "필터", noExpensesFound: "지출 내역이 없습니다",
    addNewIncome: "새 수입 추가", source: "출처", updateIncome: "수입 업데이트", noIncomesFound: "수입 내역이 없습니다",
    targetAmount: "목표 금액", setGoal: "목표 설정", editGoal: "목표 편집", currentSavings: "현재 저축", goalProgress: "목표 진행률", deleteGoal: "목표 삭제", monthlySavingsTrend: "월간 저축 추세",
    profileSettings: "프로필 설정", name: "이름", email: "이메일", age: "나이", gender: "성별", occupation: "직업", currency: "통화", primarySourceOfIncome: "주 수입원", aiConsent: "AI 동의", saveChanges: "변경 사항 저장", uploadPicture: "사진 업로드", removePicture: "사진 제거"
  },
  zh: {
    dashboard: "仪表板", expenses: "支出", incomes: "收入", savings: "储蓄", settings: "设置", language: "语言", logout: "登出",
    totalBalance: "总余额", totalExpenses: "总支出", totalIncome: "总收入",
    recentTransactions: "最近交易", noTransactionsFound: "未找到交易", topSpendingCategories: "最高支出类别",
    loadingData: "正在加载数据...", failedToLoad: "加载数据失败",
    addNewExpense: "添加新支出", category: "类别", amount: "金额", date: "日期", merchant: "商家", notes: "备注", actions: "操作", edit: "编辑", delete: "删除", save: "保存", cancel: "取消", updateExpense: "更新支出", filter: "筛选", noExpensesFound: "未找到支出",
    addNewIncome: "添加新收入", source: "来源", updateIncome: "更新收入", noIncomesFound: "未找到收入",
    targetAmount: "目标金额", setGoal: "设定目标", editGoal: "编辑目标", currentSavings: "当前储蓄", goalProgress: "目标进度", deleteGoal: "删除目标", monthlySavingsTrend: "月度储蓄趋势",
    profileSettings: "个人资料设置", name: "姓名", email: "电子邮件", age: "年龄", gender: "性别", occupation: "职业", currency: "货币", primarySourceOfIncome: "主要收入来源", aiConsent: "AI 同意", saveChanges: "保存更改", uploadPicture: "上传照片", removePicture: "删除照片"
  }
};

for (const [lang, data] of Object.entries(translations)) {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  fs.writeFileSync(path.join(langDir, 'translation.json'), JSON.stringify(data, null, 2));
}

console.log('Translations generated.');
