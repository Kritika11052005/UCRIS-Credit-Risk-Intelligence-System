import os
import subprocess
import shutil
from pathlib import Path

def run(cmd):
    """Run a shell command and print its output."""
    print(f"Executing: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(f"Stderr: {result.stderr}")
    if result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, cmd)

def main():
    print("--- Starting Prisma Setup for Render ---")
    
    # 1. Generate Prisma Client
    # This generates the python code for the client
    run("prisma generate")
    
    # 2. Fetch Binaries
    # This downloads the query engine for the current architecture
    run("prisma py fetch")
    
    # 3. Find and Copy Binary
    # Render stores build cache in /opt/render/.cache or ~/.cache
    cache_locations = [
        Path("/opt/render/.cache/prisma-python"),
        Path(os.path.expanduser("~/.cache/prisma-python"))
    ]
    
    found_binary = None
    # We are looking for the 'debian-openssl-3.0.x' version specifically for Render's environment
    target_name = "query-engine-debian-openssl-3.0.x"
    
    for loc in cache_locations:
        if loc.exists():
            print(f"Searching in {loc}...")
            # Recursively search for the query engine
            binaries = list(loc.glob(f"**/{target_name}"))
            if binaries:
                # Use the first one found (usually only one exists in a clean build)
                found_binary = binaries[0]
                break

    if not found_binary:
        print(f"CRITICAL ERROR: No {target_name} found in cache folders.")
        print("Build will likely fail at runtime with BinaryNotFoundError.")
        exit(1)

    # Target destination: the backend root directory
    # Prisma-Python looks in the project root by default
    dest = Path(".") / target_name
    print(f"Found binary at: {found_binary}")
    print(f"Copying to: {dest.absolute()}")
    
    # Copy the file while preserving permissions
    shutil.copy2(found_binary, dest)
    
    # Ensure it's executable (important for Render to run it)
    os.chmod(dest, 0o755)
    
    print(f"SUCCESS: Prisma query engine is now at {dest}")
    print("--- Prisma Setup Complete ---")

if __name__ == "__main__":
    main()
