// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TraceabilityStorage
 * @dev Stores traceability records with IPFS metadata CIDs on-chain
 * Each record is identified by a unique hash and contains:
 * - metadataCid: IPFS CID pointing to the full metadata JSON
 * - timestamp: Block timestamp when the record was stored
 * - submitter: Address that submitted the record
 */
contract TraceabilityStorage {
    struct Record {
        string metadataCid;
        uint256 timestamp;
        address submitter;
    }

    // Mapping from record hash to Record struct
    mapping(bytes32 => Record) public records;

    // Event emitted when a new record is stored
    event RecordStored(
        bytes32 indexed recordHash,
        string metadataCid,
        uint256 timestamp,
        address indexed submitter
    );

    /**
     * @dev Store a new traceability record
     * @param recordHash Unique hash identifying the record (SHA256 of record data)
     * @param metadataCid IPFS CID of the metadata JSON
     */
    function storeRecord(bytes32 recordHash, string memory metadataCid) public {
        require(records[recordHash].timestamp == 0, "Record already exists");
        require(bytes(metadataCid).length > 0, "Metadata CID cannot be empty");

        records[recordHash] = Record({
            metadataCid: metadataCid,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        emit RecordStored(recordHash, metadataCid, block.timestamp, msg.sender);
    }

    /**
     * @dev Get a traceability record by its hash
     * @param recordHash The hash of the record to retrieve
     * @return metadataCid The IPFS CID of the metadata
     * @return timestamp When the record was stored
     * @return submitter Who submitted the record
     */
    function getRecord(
        bytes32 recordHash
    )
        public
        view
        returns (
            string memory metadataCid,
            uint256 timestamp,
            address submitter
        )
    {
        Record memory record = records[recordHash];
        return (record.metadataCid, record.timestamp, record.submitter);
    }

    /**
     * @dev Check if a record exists
     * @param recordHash The hash of the record to check
     * @return exists True if the record exists
     */
    function recordExists(
        bytes32 recordHash
    ) public view returns (bool exists) {
        return records[recordHash].timestamp != 0;
    }
}
