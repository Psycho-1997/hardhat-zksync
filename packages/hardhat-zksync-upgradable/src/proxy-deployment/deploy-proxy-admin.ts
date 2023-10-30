import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as zk from 'zksync2-js';
import path from 'path';
import { DeployProxyAdminOptions } from '../utils/options';
import { deploy } from './deploy';
import { PROXY_ADMIN_JSON } from '../constants';
import { fetchOrDeployAdmin } from '../core/impl-store';
import assert from 'assert';
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types';

export interface DeployAdminFunction {
(wallet?: zk.Wallet, opts?: DeployProxyAdminOptions): Promise<string>;
}

export function makeDeployProxyAdmin(hre: HardhatRuntimeEnvironment): any {
    return async function deployProxyAdmin(wallet: zk.Wallet, opts: DeployProxyAdminOptions = {}) {
        const adminFactory = await getAdminFactory(hre, wallet);
        const adminAddress = await wallet.getAddress();
        return await fetchOrDeployAdmin(wallet.provider, async() => deploy(adminFactory), opts);
    };
}

export async function getAdminArtifact(hre: HardhatRuntimeEnvironment): Promise<ZkSyncArtifact> {
    const proxyAdminPath = (await hre.artifacts.getArtifactPaths()).find((x) =>
        x.includes(path.sep + PROXY_ADMIN_JSON)
    );
    assert(proxyAdminPath, 'Proxy admin artifact not found');
    return await import(proxyAdminPath);
}

export async function getAdminFactory(hre: HardhatRuntimeEnvironment, wallet: zk.Wallet): Promise<zk.ContractFactory> {
    const proxyAdminContract = await getAdminArtifact(hre);
    return new zk.ContractFactory(proxyAdminContract.abi, proxyAdminContract.bytecode, wallet);
}
