import os
import json
from google import genai

# Read API key from vision-service/.env
from dotenv import load_dotenv
load_dotenv(dotenv_path='c:\\Workbench\\ExpenseAnalyzer\\vision-service\\.env')

client = genai.Client()
try:
    for model in client.models.list():
        print(model.name)
except Exception as e:
    import traceback
    traceback.print_exc()
