import os
from cryptography.fernet import Fernet
from typing import Union

class EncryptionService:
    def __init__(self, key: str = None):
        if key is None:
            # In production, this should be loaded from an environment variable
            self.key = Fernet.generate_key()
        else:
            self.key = key.encode() if isinstance(key, str) else key
        self.fernet = Fernet(self.key)

    def encrypt_data(self, data: Union[str, bytes]) -> bytes:
        if isinstance(data, str):
            data = data.encode()
        return self.fernet.encrypt(data)

    def decrypt_data(self, encrypted_data: bytes) -> str:
        decrypted = self.fernet.decrypt(encrypted_data)
        return decrypted.decode()

    def encrypt_file(self, file_path: str, output_path: str):
        with open(file_path, "rb") as f:
            data = f.read()
        encrypted_data = self.fernet.encrypt(data)
        with open(output_path, "wb") as f:
            f.write(encrypted_data)

    def decrypt_file(self, encrypted_path: str) -> bytes:
        with open(encrypted_path, "rb") as f:
            data = f.read()
        return self.fernet.decrypt(data)

# Usage example (to be initialized in app state)
# encryption_service = EncryptionService(os.environ.get("ENCRYPTION_KEY"))
