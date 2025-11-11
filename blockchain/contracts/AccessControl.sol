pragma solidity 0.8.20;

/**
 * @title AccessControl
 * @dev Manages patient-centric access control for Electronic Health Records (EHR's).
 * Patients can register, upload record hashes (from IPFS), and grant/revoke
 * access to those records for healthcare providers.
 * All access attempts are logged as events for an immutable audit trail.
 */

contract AccessControl {
    // --- State Variables ---

    // Struct to store patient metadata.
    // "owner" is the patient's unique wallet address.
    struct Patient{
        address owner;
        string name;
        bool isRegistered;
        string[] recordHashes; // Array of IPFS hashes
    }

    // Struct to store provider metadata.
    struct Provider{
        address owner;
        string name;
        string hospital;
        bool isRegistered;
    }

    // Stores patient data, mapping wallet address to Patient struct
    mapping(address => Patient) public patients;

    // Stores provider data, mapping wallet address to Provider struct
    mapping(address => Provider) public providers;

    /**
     * @dev The core of the system.
     * This nested mapping checks permissions.
     * Format: mapping(patientAddress => mapping(providerAddress => mapping(recordHash => hasAccess)))
     */
    mapping(address => mapping(address => mapping(string => bool))) private permissions;

    // --- Events (for Audit Trail) ---

    event PatientRegistered(address indexed patientAddress, string name);
    event ProviderRegistered(address indexed providerAddress, string name, string hospital);
    event RecordUploaded(address indexed patientAddress, string recordHash, uint256 timestamp);
    event AccessGranted(address indexed patientAddress, address indexed providerAddress, string recordHash, uint256 timestamp);
    event AccessRevoked(address indexed patientAddress, address indexed providerAddress, string recordHash, uint256 timestamp);

    // --- Modifiers ---

    // Modifier to check if the caller is a registered patient
    modifier onlyPatient() {
        require(patients[msg.sender].isRegistered, "Caller is not a registered patient");
        _;
    }

    // Modifier to check if the caller is a registered provider
    modifier onlyProvider() {
        require(providers[msg.sender].isRegistered, "Caller is not a registered provider");
        _;
    }

    // --- Functions ---

    /**
     * @dev Registers a new patient.
     * The caller's wallet address (msg.sender) becomes their unique ID.
     */
    function registerPatient(string memory _name) public{
        require(!patients[msg.sender].isRegistered, "Patient already registered");
        patients[msg.sender] = Patient({
            owner: msg.sender,
            name: _name,
            isRegistered: true,
            recordHashes: new string[](0)
        });
        emit PatientRegistered(msg.sender, _name);
    }

    /**
     * @dev Registers a new provider (hospital, doctor, pharmacy).
     */
    function registerProvider(string memory _name, string memory _hospital) public {
        require(!providers[msg.sender].isRegistered, "Provider already registered");
        providers[msg.sender] = Provider({
            owner: msg.sender,
            name: _name,
            hospital: _hospital,
            isRegistered: true
        });
        emit ProviderRegistered(msg.sender, _name, _hospital);
    }

    /**
     * @dev Adds a new record's IPFS hash to the patient's profile.
     * This can only be called by a registered patient.
     * (In real system, you might let a provider upload *for* a patient,
     * but this "patient-upload" model is simpler to start with).
     */
    function uploadRecord(string memory _recordHash) public onlyPatient{
        patients[msg.sender].recordHashes.push(_recordHash);
        emit RecordUploaded(msg.sender, _recordHash, block.timestamp);
    }

    /**
     * @dev Grants a provider access to a specific record.
     * This is the core patient-consent function.
     * Only the patient can call this.
     */
    function grantAccess(address _providerAddress, string memory _recordHash) public onlyPatient{
        require(providers[_providerAddress].isRegistered, "Provider is not registered");
        permissions[msg.sender][_providerAddress][_recordHash] = true;
        emit AccessGranted(msg.sender, _providerAddress, _recordHash, block.timestamp);
    }

    /**
     * @dev Revokes a provider's access to a specific record.
     * Only the patient can call this.
     */
    function revokeAccess(address _providerAddress, string memory _recordHash) public onlyPatient{
        require(providers[_providerAddress].isRegistered, "Provider is not registered");
        permissions[msg.sender][_providerAddress][_recordHash] = false;
        emit AccessRevoked(msg.sender, _providerAddress, _recordHash, block.timestamp);
    }

    /**
     * @dev Allows anyone (e.g., the backend server) to check if provider
     * has access to a patient's record. This is a public "view" function,
     * so it doesn't cost any gas to call.
     */
    function checkAccess(
        address _patientAddress,
        address _providerAddress,
        string memory _recordHash
    ) public view returns (bool) {
        return permissions[_patientAddress][_providerAddress][_recordHash];
    }

    /**
     * @dev Fetches all record hashes for the calling patient.
     */
    function getMyRecords() public view onlyPatient returns (string[] memory){
        return patients[msg.sender].recordHashes;
    }

}