#!/usr/bin/python3
import os, sys, shutil

GAME_WWW = "../www"
MOD_WWW = "./www"
REPLACE_EXTENSIONS = [".png", ".ogg"]

HEADER_LENGTH = 16
SIGNATURE = "5250474D56000000"
VERSION = "000301"
REMAIN = "0000000000"
ENC_KEY = bytearray.fromhex("6d0007e52f7afb7d5a0650b0ffb8a4d1")

def usage():
	print("Usage:")
	print("  patch.py")
	print("  patch.py unpatch")

def patch():
	print("Patching...")
	for root, subdirs, files, in os.walk(MOD_WWW):
		for filename in files:	
			ext = os.path.splitext(filename)[1]
			if ext in REPLACE_EXTENSIONS:
				new = os.path.join(root, filename)
				old = new.replace(MOD_WWW, GAME_WWW)
				old = old.replace(ext, ".rpgmvp")
				replace_file(old, new)

def unpatch():
	print("Unpatching...")
	for root, subdirs, files, in os.walk(GAME_WWW):
		for filename in files:	
			if filename.endswith(".backup"):
				backup = os.path.join(root, filename)
				patched = backup.replace(".backup", "")
				
				# Restore the original file and delete the backup
				print("Restoring %s" % patched)
				shutil.copy(backup, patched)
				os.remove(backup)

def decrypt(filename, output, encrypt=False):
	dec_data = bytearray(open(filename, "rb").read())
	if not encrypt:
		dec_data = enc_data[16:]

	for i in range(0, HEADER_LENGTH):
		dec_data[i] ^= ENC_KEY[i]

	if encrypt:
		header_structure = SIGNATURE + VERSION + REMAIN
		header = bytearray(HEADER_LENGTH)
		for i in range(0, HEADER_LENGTH):
			header[i] = int("0x" + header_structure[i*2:i*2+2], 16)
		dec_data = header + dec_data

	dec_file = open(output, "wb")
	dec_file.write(dec_data)
	dec_file.close()

def replace_file(old, new):
	print("Replace '%s' with '%s'" % (old, new))

	if not os.path.exists(old):
		print("Original file does not exist")
		return
	if not os.path.exists(new):
		print("New file does not exist")
		return

	# Only backup the original file
	backup_file = old + ".backup"
	if not os.path.exists(backup_file):
		shutil.copy(old, backup_file)

	# Replace it with the encoded mod file, assume its a png for now
	decrypt(new, old, True)

if __name__ == "__main__":
	cmd = "patch"
	if len(sys.argv) > 1:
		cmd = sys.argv[1]
	
	if cmd == "patch":
		patch()
	elif cmd == "unpatch":
		unpatch()
	else:
		usage()

