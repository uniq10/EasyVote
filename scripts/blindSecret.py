#!/usr/bin/python3

import sys
from Crypto.Hash import SHA512
from Crypto.Util import number
from authorityData import *

def getBlindedSecret(secret, seed):
    hashedSecret = int(SHA512.SHA512Hash(bytes(secret, 'utf-8')).hexdigest(), 16)
    r = seed
    while number.GCD(seed, AUTH_PUBLIC_KEY_N) != 1:
        r += 1
    blindedSecret = ((r ** AUTH_PUBLIC_KEY_E) * hashedSecret) % AUTH_PUBLIC_KEY_N

    return hex(blindedSecret)

if __name__ == '__main__':
    secret = sys.argv[1]
    seed = int(sys.argv[2])

    print(getBlindedSecret(secret, seed))
