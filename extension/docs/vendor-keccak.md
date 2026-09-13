# Vendored Keccak dependency

- Package: `js-sha3`
- Version: `0.13.0`
- Upstream: https://github.com/emn178/js-sha3
- Source artifact: `build/sha3.mjs`
- npm integrity: `sha512-v2qy9Guw8XMOYFauObtG1kXLfut7AcSRgBP2rq4R14gVFAO2fW5kjcHcPWkA2IUDbY0cGGZypDMUuP/kkbvNGw==` # git-secret-ignore
- License: MIT (see upstream `LICENSE.txt`)

The vendored module is used only for `keccak256` in the Quai mixed-case address checksum. It is not loaded from a remote URL at runtime. The integrity value above is the npm registry receipt observed when vendoring; the full package artifact and license should be rechecked during dependency review before release.
