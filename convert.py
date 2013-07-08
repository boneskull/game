#!/usr/bin/env python

import Image
import os
import sys

infile = sys.argv[1]
f, e = os.path.splitext(infile)
print infile
outfile = f + '.png'
if infile != outfile:
	im = Image.open(infile)
	im.crop((0,41,82,82)).convert('RGBA').save(outfile, 'PNG')

