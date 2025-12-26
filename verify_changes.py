
import csv

try:
    with open('data/train.csv', 'r') as f:
        reader = csv.DictReader(f)
        if 'accident_risk_level' not in reader.fieldnames:
            print("Error: accident_risk_level column missing")
            exit(1)
            
        print("Column accident_risk_level exists.")
        
        counts = {'low': 0, 'medium': 0, 'high': 0, 'unknown': 0}
        rows_to_check = 5
        
        print("\nSample rows:")
        for i, row in enumerate(reader):
            level = row['accident_risk_level']
            stats_key = level if level in counts else 'unknown'
            counts[stats_key] += 1
            
            if i < rows_to_check:
                print(f"Risk: {row['accident_risk']} -> Level: {level}")
        
        print("\nDistribution:")
        for k, v in counts.items():
            print(f"{k}: {v}")

except Exception as e:
    print(f"Verification failed: {e}")
