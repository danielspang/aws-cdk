import '@aws-cdk/assert-internal/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as eks from '../lib';
import { NodegroupAmiType } from '../lib';
import { testFixture } from './util';

/* eslint-disable max-len */

const CLUSTER_VERSION = eks.KubernetesVersion.V1_21;

describe('node group', () => {

  test('default ami type is not applied when launch template is configured', () => {

    // GIVEN
    const { stack, vpc } = testFixture();

    const launchTemplate = new ec2.CfnLaunchTemplate(stack, 'LaunchTemplate', {
      launchTemplateData: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.MEDIUM).toString(),
      },
    });

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.LARGE)],
      launchTemplateSpec: {
        id: launchTemplate.ref,
        version: launchTemplate.attrLatestVersionNumber,
      },
    });

    // THEN
    const root = stack.node.root as cdk.App;
    const stackArtifact = root.synth().getStackByName(stack.stackName);
    expect(stackArtifact.template.Resources.Nodegroup62B4B2C1.Properties.AmiType).toBeUndefined();

  });

  test('explicit ami type is applied even when launch template is configured', () => {

    // GIVEN
    const { stack, vpc } = testFixture();

    const launchTemplate = new ec2.CfnLaunchTemplate(stack, 'LaunchTemplate', {
      launchTemplateData: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.MEDIUM).toString(),
      },
    });

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      launchTemplateSpec: {
        id: launchTemplate.ref,
        version: launchTemplate.attrLatestVersionNumber,
      },
    });

    // THEN
    const root = stack.node.root as cdk.App;
    const stackArtifact = root.synth().getStackByName(stack.stackName);
    expect(stackArtifact.template.Resources.Nodegroup62B4B2C1.Properties.AmiType).toEqual('AL2_x86_64');

  });

  test('ami type is taken as is when no instance types are configured', () => {

    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      amiType: eks.NodegroupAmiType.AL2_X86_64_GPU,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      AmiType: 'AL2_x86_64_GPU',
    });

  });

  test('create a default nodegroup correctly', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', { cluster });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      NodeRole: {
        'Fn::GetAtt': [
          'NodegroupNodeGroupRole038A128B',
          'Arn',
        ],
      },
      Subnets: [
        {
          Ref: 'VPCPrivateSubnet1Subnet8BCA10E0',
        },
        {
          Ref: 'VPCPrivateSubnet2SubnetCFCDAA7A',
        },
      ],
      ForceUpdateEnabled: true,
      ScalingConfig: {
        DesiredSize: 2,
        MaxSize: 2,
        MinSize: 1,
      },
    });


  });

  test('create a x86_64 bottlerocket nodegroup correctly', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      amiType: NodegroupAmiType.BOTTLEROCKET_X86_64,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      NodeRole: {
        'Fn::GetAtt': [
          'NodegroupNodeGroupRole038A128B',
          'Arn',
        ],
      },
      Subnets: [
        {
          Ref: 'VPCPrivateSubnet1Subnet8BCA10E0',
        },
        {
          Ref: 'VPCPrivateSubnet2SubnetCFCDAA7A',
        },
      ],
      AmiType: 'BOTTLEROCKET_x86_64',
      ForceUpdateEnabled: true,
      ScalingConfig: {
        DesiredSize: 2,
        MaxSize: 2,
        MinSize: 1,
      },
    });


  });
  test('create a ARM_64 bottlerocket nodegroup correctly', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      amiType: NodegroupAmiType.BOTTLEROCKET_ARM_64,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      NodeRole: {
        'Fn::GetAtt': [
          'NodegroupNodeGroupRole038A128B',
          'Arn',
        ],
      },
      Subnets: [
        {
          Ref: 'VPCPrivateSubnet1Subnet8BCA10E0',
        },
        {
          Ref: 'VPCPrivateSubnet2SubnetCFCDAA7A',
        },
      ],
      AmiType: 'BOTTLEROCKET_ARM_64',
      ForceUpdateEnabled: true,
      ScalingConfig: {
        DesiredSize: 2,
        MaxSize: 2,
        MinSize: 1,
      },
    });


  });
  test('aws-auth will be updated', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', { cluster });

    // THEN
    // THEN
    expect(stack).toHaveResource(eks.KubernetesManifest.RESOURCE_TYPE, {
      Manifest: {
        'Fn::Join': [
          '',
          [
            '[{"apiVersion":"v1","kind":"ConfigMap","metadata":{"name":"aws-auth","namespace":"kube-system","labels":{"aws.cdk.eks/prune-c82ececabf77e03e3590f2ebe02adba8641d1b3e76":""}},"data":{"mapRoles":"[{\\"rolearn\\":\\"',
            {
              'Fn::GetAtt': [
                'ClusterMastersRole9AA35625',
                'Arn',
              ],
            },
            '\\",\\"username\\":\\"',
            {
              'Fn::GetAtt': [
                'ClusterMastersRole9AA35625',
                'Arn',
              ],
            },
            '\\",\\"groups\\":[\\"system:masters\\"]},{\\"rolearn\\":\\"',
            {
              'Fn::GetAtt': [
                'NodegroupNodeGroupRole038A128B',
                'Arn',
              ],
            },
            '\\",\\"username\\":\\"system:node:{{EC2PrivateDNSName}}\\",\\"groups\\":[\\"system:bootstrappers\\",\\"system:nodes\\"]}]","mapUsers":"[]","mapAccounts":"[]"}}]',
          ],
        ],
      },
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      RoleArn: {
        'Fn::GetAtt': [
          'ClusterCreationRole360249B6',
          'Arn',
        ],
      },
      PruneLabel: 'aws.cdk.eks/prune-c82ececabf77e03e3590f2ebe02adba8641d1b3e76',
    });

  });
  test('create nodegroup correctly with security groups provided', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      remoteAccess: {
        sshKeyName: 'foo',
        sourceSecurityGroups: [new ec2.SecurityGroup(stack, 'SG', { vpc })],
      },
    });
    // THEN
    expect(stack).toHaveResource('AWS::EKS::Nodegroup', {
      RemoteAccess: {
        Ec2SshKey: 'foo',
        SourceSecurityGroups: [
          {
            'Fn::GetAtt': [
              'SGADB53937',
              'GroupId',
            ],
          },
        ],
      },
    });


  });
  test('create nodegroup with forceUpdate disabled', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', { cluster, forceUpdate: false });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ForceUpdateEnabled: false,
    });


  });
  test('create nodegroup with instanceType provided', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      instanceType: new ec2.InstanceType('m5.large'),
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      InstanceTypes: [
        'm5.large',
      ],
    });


  });
  test('create nodegroup with on-demand capacity type', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      instanceType: new ec2.InstanceType('m5.large'),
      capacityType: eks.CapacityType.ON_DEMAND,
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      InstanceTypes: [
        'm5.large',
      ],
      CapacityType: 'ON_DEMAND',
    });


  });
  test('create nodegroup with spot capacity type', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      instanceTypes: [
        new ec2.InstanceType('m5.large'),
        new ec2.InstanceType('t3.large'),
        new ec2.InstanceType('c5.large'),
      ],
      capacityType: eks.CapacityType.SPOT,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      InstanceTypes: [
        'm5.large',
        't3.large',
        'c5.large',
      ],
      CapacityType: 'SPOT',
    });


  });
  test('create nodegroup with on-demand capacity type and multiple instance types', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      instanceTypes: [
        new ec2.InstanceType('m5.large'),
        new ec2.InstanceType('t3.large'),
        new ec2.InstanceType('c5.large'),
      ],
      capacityType: eks.CapacityType.ON_DEMAND,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      InstanceTypes: [
        'm5.large',
        't3.large',
        'c5.large',
      ],
      CapacityType: 'ON_DEMAND',
    });


  });
  test('throws when both instanceTypes and instanceType defined', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // THEN
    expect(() => cluster.addNodegroupCapacity('ng', {
      instanceType: new ec2.InstanceType('m5.large'),
      instanceTypes: [
        new ec2.InstanceType('m5.large'),
        new ec2.InstanceType('t3.large'),
        new ec2.InstanceType('c5.large'),
      ],
      capacityType: eks.CapacityType.SPOT,
    })).toThrow(/"instanceType is deprecated, please use "instanceTypes" only/);

  });
  test('create nodegroup with neither instanceTypes nor instanceType defined', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      capacityType: eks.CapacityType.SPOT,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      CapacityType: 'SPOT',
    });


  });
  test('throws when instanceTypes provided with different CPU architrcture', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // THEN
    expect(() => cluster.addNodegroupCapacity('ng', {
      instanceTypes: [
        // X86
        new ec2.InstanceType('c5.large'),
        new ec2.InstanceType('c5a.large'),
        // ARM64
        new ec2.InstanceType('m6g.large'),
      ],
    })).toThrow(/instanceTypes of different CPU architectures is not allowed/);

  });
  test('throws when amiType provided is incorrect', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // THEN
    expect(() => cluster.addNodegroupCapacity('ng', {
      instanceTypes: [
        new ec2.InstanceType('c5.large'),
        new ec2.InstanceType('c5a.large'),
        new ec2.InstanceType('c5d.large'),
      ],
      // incorrect amiType
      amiType: eks.NodegroupAmiType.AL2_ARM_64,
    })).toThrow(/The specified AMI does not match the instance types architecture/);

  });

  test('remoteAccess without security group provided', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    new eks.Nodegroup(stack, 'Nodegroup', {
      cluster,
      remoteAccess: {
        sshKeyName: 'foo',
      },
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      RemoteAccess: {
        Ec2SshKey: 'foo',
      },
    });


  });

  test('import nodegroup correctly', () => {
    // GIVEN
    const { stack: stack1, vpc, app } = testFixture();
    const stack2 = new cdk.Stack(app, 'stack2', { env: { region: 'us-east-1' } });
    const cluster = new eks.Cluster(stack1, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });

    // WHEN
    // const cluster = new eks.Cluster(stack, 'Cluster', { vpc, kubectlEnabled: true, defaultCapacity: 0 });
    const ng = new eks.Nodegroup(stack1, 'Nodegroup', { cluster });
    const imported = eks.Nodegroup.fromNodegroupName(stack2, 'ImportedNg', ng.nodegroupName);
    new cdk.CfnOutput(stack2, 'NodegroupName', { value: imported.nodegroupName });

    // THEN
    expect(stack2).toMatchTemplate({
      Outputs: {
        NodegroupName: {
          Value: {
            'Fn::ImportValue': 'Stack:ExportsOutputRefNodegroup62B4B2C1EF8AB7C1',
          },
        },
      },
    });

  });
  test('addNodegroup correctly', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });

    // WHEN
    cluster.addNodegroupCapacity('ng');

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      NodeRole: {
        'Fn::GetAtt': [
          'ClusterNodegroupngNodeGroupRoleDA0D35DA',
          'Arn',
        ],
      },
      Subnets: [
        {
          Ref: 'VPCPrivateSubnet1Subnet8BCA10E0',
        },
        {
          Ref: 'VPCPrivateSubnet2SubnetCFCDAA7A',
        },
      ],
      ForceUpdateEnabled: true,
      ScalingConfig: {
        DesiredSize: 2,
        MaxSize: 2,
        MinSize: 1,
      },
    });


  });
  test('add node group with taints', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });

    // WHEN
    cluster.addNodegroupCapacity('ng', {
      taints: [
        {
          effect: eks.TaintEffect.NO_SCHEDULE,
          key: 'foo',
          value: 'bar',
        },
      ],
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ClusterName: {
        Ref: 'Cluster9EE0221C',
      },
      Taints: [
        {
          Effect: 'NO_SCHEDULE',
          Key: 'foo',
          Value: 'bar',
        },
      ],
    });


  });
  test('throws when desiredSize > maxSize', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // THEN
    expect(() => cluster.addNodegroupCapacity('ng', { desiredSize: 3, maxSize: 2 })).toThrow(/Desired capacity 3 can't be greater than max size 2/);

  });
  test('throws when desiredSize < minSize', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // THEN
    expect(() => cluster.addNodegroupCapacity('ng', { desiredSize: 2, minSize: 3 })).toThrow(/Minimum capacity 3 can't be greater than desired size 2/);

  });
  test('can set minSize , maxSize and DesiredSize', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // WHEN
    new eks.Nodegroup(stack, 'NodeGroup', {
      cluster: cluster,
      minSize: 2,
      maxSize: 6,
      desiredSize: 4,
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ScalingConfig: {
        MinSize: 2,
        MaxSize: 6,
        DesiredSize: 4,
      },
    });


  });
  test('validation is not performed when using Tokens', () => {
    // GIVEN
    const { stack, vpc } = testFixture();
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    // WHEN
    new eks.Nodegroup(stack, 'NodeGroup', {
      cluster: cluster,
      minSize: cdk.Lazy.number({ produce: () => 5 }),
      maxSize: cdk.Lazy.number({ produce: () => 1 }),
      desiredSize: cdk.Lazy.number({ produce: () => 20 }),
    });
    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      ScalingConfig: {
        MinSize: 5,
        MaxSize: 1,
        DesiredSize: 20,
      },
    });


  });
  test('create nodegroup correctly with launch template', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'set -o xtrace',
      `/etc/eks/bootstrap.sh ${cluster.clusterName}`,
    );
    const lt = new ec2.CfnLaunchTemplate(stack, 'LaunchTemplate', {
      launchTemplateData: {
        imageId: new eks.EksOptimizedImage().getImage(stack).imageId,
        instanceType: new ec2.InstanceType('t3.small').toString(),
        userData: cdk.Fn.base64(userData.render()),
      },
    });
    cluster.addNodegroupCapacity('ng-lt', {
      launchTemplateSpec: {
        id: lt.ref,
        version: lt.attrDefaultVersionNumber,
      },
    });

    // THEN
    expect(stack).toHaveResourceLike('AWS::EKS::Nodegroup', {
      LaunchTemplate: {
        Id: {
          Ref: 'LaunchTemplate',
        },
        Version: {
          'Fn::GetAtt': [
            'LaunchTemplate',
            'DefaultVersionNumber',
          ],
        },
      },
    });


  });
  test('throws when both diskSize and launch template specified', () => {
    // GIVEN
    const { stack, vpc } = testFixture();

    // WHEN
    const cluster = new eks.Cluster(stack, 'Cluster', {
      vpc,
      defaultCapacity: 0,
      version: CLUSTER_VERSION,
    });
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'set -o xtrace',
      `/etc/eks/bootstrap.sh ${cluster.clusterName}`,
    );
    const lt = new ec2.CfnLaunchTemplate(stack, 'LaunchTemplate', {
      launchTemplateData: {
        imageId: new eks.EksOptimizedImage().getImage(stack).imageId,
        instanceType: new ec2.InstanceType('t3.small').toString(),
        userData: cdk.Fn.base64(userData.render()),
      },
    });
    // THEN
    expect(() =>
      cluster.addNodegroupCapacity('ng-lt', {
        diskSize: 100,
        launchTemplateSpec: {
          id: lt.ref,
          version: lt.attrDefaultVersionNumber,
        },
      })).toThrow(/diskSize must be specified within the launch template/);

  });
});
