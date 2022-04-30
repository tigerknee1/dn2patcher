# dn2patcher
A simple modding tool for Didnapper 2. It replaces the game files with ones found in www/* and backs up the original ones. You just need python to run it.

# How to use
Clone this repository into Didnapper 2's root folder.

Add your custom image/audio files into www/ each file should have the same name as an existing rpgmvp file in the games www folder. Use png files for images and ogg files for audio, they all automatically be encoded and turned into rpgmvp files. Have a look in the www folder for examples of this.

Run patch.py

And that's it! If you try running the game now you should see a different splashscreen with the text "Patched" in the bottom right corner.

# How to undo
To restore the original files you can run...

    patch.py unpatch

# How to decode the files in the first place
You can run the following to dump all the images / sounds into a folder called dump

    patch.py dump
