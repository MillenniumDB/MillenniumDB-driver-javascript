def test():
    str1 = "(\\w\\w\n\r\v\f\t)"
    str2 = R"(\w\n\n\r\v\f\t)"  # raw string
    print(str1, str2)


test()
