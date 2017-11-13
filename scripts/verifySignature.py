#!/usr/bin/python3

import sys
from Crypto.Hash import SHA512
from authorityData import *

AUTH_PUBLIC_KEY_D = 35113647301148597661219974965825197099969499992771535637570104434838764280720273728159572193792057239555562654242774414087460201139277959866399250698600461422713156853556141667944933868036503097250086259006926979119504504598362872447156244183560794325858361366573965449134058365289067005307860927088206985473

def verifySignatue(secret, signature):
    hashedSecret = int(SHA512.SHA512Hash(bytes(secret, 'utf-8')).hexdigest(), 16)
    print("sdfd", hashedSecret)
    hashedSecretSignature = pow(hashedSecret, AUTH_PUBLIC_KEY_D, AUTH_PUBLIC_KEY_N)

    return signature == hashedSecretSignature

if __name__ == '__main__':
    secret = sys.argv[1]
    signature = int(sys.argv[2], 16)

    print(verifySignatue(secret, signature))
