import csv

with open('data.csv') as f:
    csva = csv.reader(f)
    headers = next(csva)
    for row in csva:
        d = {
            "time": row[1],
            'epc': row[2],
            'tid': row[3],
            'status': row[4],
            'rssi': row[5],
            'distance': row[6],
            'dB': row[7],
        }

