class A(object):
    def __init__(self):
        print 'A'+ str(id(self))
    
    def who(self):
        print 'A'
        print 'A'+ str(id(self))

class B(object):
    def __init__(self):
        super(B, self).__init__()

class C(B, A):
    def __init__(self):
        print 'C' +str(id(self))
        super(C, self).__init__()
        
if __name__ == '__main__':
    c = C()

