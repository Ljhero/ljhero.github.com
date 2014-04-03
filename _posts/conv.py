#!/usr/lib/env python
# coding: utf-8
import sys, codecs

def main(path):
    content = ''
    is_start = True
    with codecs.open(path, 'r', 'utf-8') as fp:
        for line in fp:
            if len(line) >=3 and line[:3] == '```':
                if is_start:
                    content += ''.join(["{% highlight ", line[3:-1]," %}\n"]) if line[3:-1] else "{% highlight bash %}\n"
                    is_start = False
                else:
                    content += '{% endhighlight %}\n'	
                    is_start = True
            else:
                content += line

    with codecs.open(path, 'w', 'utf-8') as fp:
        fp.write(content)

    print "Convert Success"


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print 'Please input file path'
        sys.exit(1)
    main(sys.argv[1])
