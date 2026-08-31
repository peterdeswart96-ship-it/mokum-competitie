const { BlobServiceClient } = require('@azure/storage-blob');

const CONTAINER_NAME = 'cuescore-cache';

let containerClientPromise = null;

function getContainerClient() {
  if (!containerClientPromise) {
    const connectionString = process.env.AzureWebJobsStorage;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    containerClientPromise = containerClient.createIfNotExists().then(() => containerClient);
  }
  return containerClientPromise;
}

async function streamToString(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function getCachedTournament(tournamentId) {
  const containerClient = await getContainerClient();
  const blobClient = containerClient.getBlobClient(`tournament-${tournamentId}.json`);

  try {
    const download = await blobClient.download();
    const body = await streamToString(download.readableStreamBody);
    return {
      data: JSON.parse(body),
      updatedAt: download.metadata?.updatedat || null,
    };
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

async function setCachedTournament(tournamentId, data) {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(`tournament-${tournamentId}.json`);
  const body = JSON.stringify(data);
  const updatedAt = new Date().toISOString();

  await blockBlobClient.upload(body, Buffer.byteLength(body), {
    blobHTTPHeaders: { blobContentType: 'application/json' },
    metadata: { updatedat: updatedAt },
  });

  return updatedAt;
}

module.exports = { getCachedTournament, setCachedTournament };
