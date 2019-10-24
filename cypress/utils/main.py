#!/usr/local/bin/python3
import argparse
import os
import gen_stubs

parser = argparse.ArgumentParser(description='MDS Integration Test Utility (ITU)')
parser.add_argument('verb', type=str, nargs='+',
                    help='action to perform (stub | codecov)')
parser.add_argument('mds_core_path', nargs='+',
                    help='path to mds-core')

args = parser.parse_args()
if args.verb[0].startswith('stub:'):
  action = args.verb[0].split(':')[1]
  if action == 'generate':
    gen_stubs.write_test_files(args.mds_core_path[0])
  elif action == 'clean':
    gen_stubs.clean_test_files(args.mds_core_path[0])