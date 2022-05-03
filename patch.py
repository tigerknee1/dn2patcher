#!/usr/bin/python3
import os, sys, shutil

GAME_WWW = "../www"
MOD_WWW = "./www"
DUMP_WWW = "../dump"
REPLACE_EXTENSIONS = [".png", ".ogg", ".js", ".json"]
ENCRYPTED_EXTENSIONS = [".png", ".ogg"]

HEADER_LENGTH = 16
SIGNATURE = "5250474D56000000"
VERSION = "000301"
REMAIN = "0000000000"
ENC_KEY = bytearray.fromhex("6d0007e52f7afb7d5a0650b0ffb8a4d1")

def usage():
	print("Usage:")
	print("  patch.py")
	print("  patch.py unpatch")
	print("  patch.py dump")

def patch():
	print("Patching...")
	for root, subdirs, files, in os.walk(MOD_WWW):
		for filename in files:	
			ext = os.path.splitext(filename)[1]
			if ext in REPLACE_EXTENSIONS:
				new = os.path.join(root, filename)
				old = new.replace(MOD_WWW, GAME_WWW)
				if ext in ENCRYPTED_EXTENSIONS:
					old = old.replace(ext, ".rpgmvp")
					replace_file(old, new, True)
				else:
					replace_file(old, new, False)

def unpatch():
	print("Unpatching...")
	for root, subdirs, files, in os.walk(GAME_WWW):
		for filename in files:	
			if filename.endswith(".backup"):
				# Restore the original file and delete the backup
				backup = os.path.join(root, filename)
				patched = backup.replace(".backup", "")

				print("Restoring %s" % patched)
				shutil.copy(backup, patched)
				os.remove(backup)
			elif filename.endswith(".patch"):
				# Delete added files
				patch_file = os.path.join(root, filename)
				patched = patch_file.replace(".patch", "")

				print("Deleting %s" % patched)
				os.remove(patched)
				os.remove(patch_file)

def dump():
	print("Dumping...")
	if not os.path.isdir(DUMP_WWW):
		os.mkdir(DUMP_WWW)
	dump_folder("img", ".rpgmvp", ".png")
	dump_folder("audio", ".rpgmvo", ".ogg")

def dump_folder(base_folder, from_ext, to_ext):
	for root, subdirs, files, in os.walk(os.path.join(GAME_WWW, base_folder)):
		folder = root.replace(GAME_WWW, DUMP_WWW)
		if not os.path.isdir(folder):
			print("Creating folder %s" % folder)
			os.mkdir(folder)
		for filename in files:
			filepath = os.path.join(root, filename)
			output = filename.replace(from_ext, to_ext)
			output = os.path.join(folder, output)
			print("Dumping %s to %s" % (filepath, output))
			decrypt(filepath, output)


def decrypt(filename, output, encrypt=False):
	dec_data = bytearray(open(filename, "rb").read())
	if not encrypt:
		dec_data = dec_data[16:]

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

def replace_file(old, new, needToEncrypt):

	if not os.path.exists(new):
		print("New file does not exist")
		return

	if os.path.exists(old):
		# Only backup the original file
		print("Replace '%s' with '%s'" % (old, new))
		backup_file = old + ".backup"
		if not os.path.exists(backup_file):
			shutil.copy(old, backup_file)
	else:	
		# Create a .patch file to mark the file as non-original
		print("New file '%s'" % new)
		patch_file = old + ".patch"
		if not os.path.exists(patch_file):
			f = open(patch_file, "w")
			f.close()

	if needToEncrypt:
		decrypt(new, old, True)
	else:
		shutil.copy(new, old)

if __name__ == "__main__":
	cmd = "patch"
	if len(sys.argv) > 1:
		cmd = sys.argv[1]
	
	if cmd == "patch":
		patch()
	elif cmd == "unpatch":
		unpatch()
	elif cmd == "dump":
		dump()
	else:
		usage()

