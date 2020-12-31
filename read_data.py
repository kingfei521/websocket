import csv
import pandas as pd
pd.set_option('display.max_columns', None)
pf = pd.read_csv('data.csv')
# print(pf)
with open('data.csv') as f:
    csva = csv.reader(f)
    headers = next(csva)
    for row in csva:
        d = {
            "time": row[1],
            'epc': row[2],
            'tid': row[3],
        }
        print(d)