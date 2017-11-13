#!/usr/bin/python3

import sys
from Crypto.Util import number
from authorityData import *

def getUnblindedSecret(secret, seed):
    r = seed
    while number.GCD(seed, AUTH_PUBLIC_KEY_N) != 1:
        r += 1
    assert number.GCD(r, AUTH_PUBLIC_KEY_N) == 1
    r_inv = number.inverse(r, AUTH_PUBLIC_KEY_N)
    assert r * r_inv % AUTH_PUBLIC_KEY_N == 1
    unblindedSecret = (r_inv * secret) % AUTH_PUBLIC_KEY_N

    return hex(unblindedSecret)

if __name__ == '__main__':
    secret = int(sys.argv[1], 16)
    seed = int(sys.argv[2])

    print(getUnblindedSecret(secret, seed))
