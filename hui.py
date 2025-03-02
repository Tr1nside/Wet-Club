class Calculate:
    def __init__(self, num1, num2, operation):
        self.num1 = num1
        self.num2 = num2
        self.operation = operation
        self.operations = {
            '+': self.add,
            '-': self.subtract,
            '*': self.multiply,
            '/': self.divide}

    def add(self):
        return self.num1 + self.num2

    def subtract(self):
        return self.num1 - self.num2

    def multiply(self):
        return self.num1 * self.num2

    def divide(self):
        if self.num2 == 0:
            return "РћС€РёР±РєР°: РґРµР»РµРЅРёРµ РЅР° РЅРѕР»СЊ"
        return self.num1 / self.num2

    def calculate(self):
        # РџРѕР»СѓС‡Р°РµРј СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰СѓСЋ С„СѓРЅРєС†РёСЋ РёР· СЃР»РѕРІР°СЂСЏ РїРѕ РѕРїРµСЂР°С†РёРё
        operation_func = self.operations.get(self.operation)
        if operation_func:
            return operation_func()
        else:
            return "РћС€РёР±РєР°: РЅРµРґРѕРїСѓСЃС‚РёРјР°СЏ РѕРїРµСЂР°С†РёСЏ"


# РџСЂРёРјРµСЂ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ
calc = Calculate(10, 5, '/')
result = calc.calculate()
print(result)