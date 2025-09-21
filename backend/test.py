from hyperon  import MeTTa

metta  = MeTTa()
# last_result = metta.run('!(+ 1 2)')
# print(last_result)

#  output [[3]]

with open("final/logic.metta") as file:
    metta.run(file.read())
    output = metta.run('!(content-any bob)')
    print(output)