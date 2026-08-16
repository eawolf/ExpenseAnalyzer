import os
import re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add useTranslation if not present
    if 'useTranslation' not in content:
        content = re.sub(r'(import .* from [\'\"].*[\'\"];\n)', r'\1import { useTranslation } from \'react-i18next\';\n', content, count=1)
        
    if 'const { t } = useTranslation();' not in content:
        content = re.sub(r'(export default function \w+\(\)\s*\{)', r'\1\n  const { t } = useTranslation();', content)
        
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

expenses_path = 'src/app/dashboard/expenses/page.tsx'
reps = {
    '>Filter ': '>{t(\'filter\', \'Filter\')} ',
    'Filter by Category': '{t(\'filterByCategory\', \'Filter by Category\')}',
    'Clear Filters': '{t(\'clearFilters\', \'Clear Filters\')}',
    'No expenses found.': '{t(\'noExpensesFound\', \'No expenses found.\')}',
    'Edit Expense': '{t(\'editExpense\', \'Edit Expense\')}',
    '>Amount<': '>{t(\'amount\', \'Amount\')}<',
    '>Date<': '>{t(\'date\', \'Date\')}<',
    'Merchant (Optional)': '{t(\'merchantOptional\', \'Merchant (Optional)\')}',
    'Categories (comma separated)': '{t(\'categoriesComma\', \'Categories (comma separated)\')}',
    'Notes (Optional)': '{t(\'notesOptional\', \'Notes (Optional)\')}',
    '>Cancel<': '>{t(\'cancel\', \'Cancel\')}<',
    '>Save Changes<': '>{t(\'saveChanges\', \'Save Changes\')}<',
}
update_file(expenses_path, reps)

incomes_path = 'src/app/dashboard/incomes/page.tsx'
incomes_reps = {
    '>Filter ': '>{t(\'filter\', \'Filter\')} ',
    'Filter by Category': '{t(\'filterByCategory\', \'Filter by Category\')}',
    'Clear Filters': '{t(\'clearFilters\', \'Clear Filters\')}',
    'No incomes found.': '{t(\'noIncomesFound\', \'No incomes found.\')}',
    'Edit Income': '{t(\'editIncome\', \'Edit Income\')}',
    '>Amount<': '>{t(\'amount\', \'Amount\')}<',
    '>Date<': '>{t(\'date\', \'Date\')}<',
    'Source (Optional)': '{t(\'sourceOptional\', \'Source (Optional)\')}',
    'Notes (Optional)': '{t(\'notesOptional\', \'Notes (Optional)\')}',
    '>Cancel<': '>{t(\'cancel\', \'Cancel\')}<',
    '>Save Changes<': '>{t(\'saveChanges\', \'Save Changes\')}<',
}
update_file(incomes_path, incomes_reps)

savings_path = 'src/app/dashboard/savings/page.tsx'
savings_reps = {
    'Target Amount': '{t(\'targetAmount\', \'Target Amount\')}',
    'Set Goal': '{t(\'setGoal\', \'Set Goal\')}',
    'Edit Goal': '{t(\'editGoal\', \'Edit Goal\')}',
    'Current Savings': '{t(\'currentSavings\', \'Current Savings\')}',
    'Goal Progress': '{t(\'goalProgress\', \'Goal Progress\')}',
    'Delete Goal': '{t(\'deleteGoal\', \'Delete Goal\')}',
    'Monthly Savings Trend': '{t(\'monthlySavingsTrend\', \'Monthly Savings Trend\')}',
    'Edit Savings Goal': '{t(\'editSavingsGoal\', \'Edit Savings Goal\')}',
    'Save Goal': '{t(\'saveGoal\', \'Save Goal\')}',
    '>Cancel<': '>{t(\'cancel\', \'Cancel\')}<',
}
update_file(savings_path, savings_reps)

settings_path = 'src/app/dashboard/settings/page.tsx'
settings_reps = {
    'Profile Settings': '{t(\'profileSettings\', \'Profile Settings\')}',
    '>Name<': '>{t(\'name\', \'Name\')}<',
    '>Email<': '>{t(\'email\', \'Email\')}<',
    '>Age<': '>{t(\'age\', \'Age\')}<',
    '>Gender<': '>{t(\'gender\', \'Gender\')}<',
    '>Occupation<': '>{t(\'occupation\', \'Occupation\')}<',
    '>Currency<': '>{t(\'currency\', \'Currency\')}<',
    'Primary Source of Income': '{t(\'primarySourceOfIncome\', \'Primary Source of Income\')}',
    'AI Consent': '{t(\'aiConsent\', \'AI Consent\')}',
    '>Save Changes<': '>{t(\'saveChanges\', \'Save Changes\')}<',
    'Upload Picture': '{t(\'uploadPicture\', \'Upload Picture\')}',
    'Remove Picture': '{t(\'removePicture\', \'Remove Picture\')}'
}
update_file(settings_path, settings_reps)

print('Updated translations in components')
