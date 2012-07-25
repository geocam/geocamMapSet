#!/usr/bin/env python
import json
import sys

if __name__ == '__main__':
    with open(sys.argv[1]) as infile:
        objs = json.loads(infile.read())

        new_objs = []
        for obj in objs:
            if obj['model'] == "geocamMapSet.librarylayer":
                fields = obj['fields']
                for k,v in json.loads(fields['json']).items():
                    if k == 'url':
                        assert v == fields['externalUrl']
                        continue
                    fields[k] = v
                del fields['json']

                obj['fields'] = fields

            elif obj['model'] == 'geocamMapSet.mapsetlayer':
                for k,v in json.loads(obj['fields']['json']).items():
                    assert obj['fields'][k] == v
                del obj['fields']['json']

            new_objs.append(obj)
        
    print json.dumps(new_objs, indent=4)
