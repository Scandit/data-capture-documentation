import subprocess
import os

def run_command(command):
    process = subprocess.run(command, shell=True, capture_output=True, text=True)
    if process.returncode != 0:
        print(f"Error executing command: {command}")
        print(process.stderr)
    return process.stdout.strip()

def main():
    with open("files_to_process.txt", "r") as f:
        files = f.read().splitlines()

    chunk_size = 20
    for i in range(0, len(files), chunk_size):
        chunk = files[i:i+chunk_size]
        for file in chunk:
            run_command(f"./process_single_file.sh '{file}'")

        # After processing a chunk, we need to commit the changes,
        # otherwise the next chunk will cause the 'too many files' error.
        # I will just checkout the files for now
        run_command("git checkout -- .")


if __name__ == "__main__":
    main()
