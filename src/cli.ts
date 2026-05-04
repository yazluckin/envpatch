#!/usr/bin/env node
/**
 * CLI entry point for envpatch.
 * Provides commands for diffing, merging, patching, validating, and snapshotting .env files.
 */

import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { parseEnv, serializeEnv } from "./parser";
import { diffEnv, formatDiffSummary } from "./diff";
import { mergeEnv, formatMergeSummary } from "./merge";
import { patchEnvFile } from "./patchFile";
import { validateEnvFileAndReport } from "./validateFile";
import { snapshotEnvFile, listSnapshots, compareLatestSnapshots } from "./snapshotFile";
import { maskEnv } from "./mask";

const VERSION = "0.1.0";

program
  .name("envpatch")
  .description("Safely diff and merge .env files across environments without exposing secrets.")
  .version(VERSION);

/** diff: Show differences between two .env files */
program
  .command("diff <base> <target>")
  .description("Show differences between two .env files")
  .option("--no-mask", "Do not mask sensitive values in output")
  .action((base: string, target: string, opts: { mask: boolean }) => {
    const baseEnv = parseEnv(fs.readFileSync(path.resolve(base), "utf-8"));
    const targetEnv = parseEnv(fs.readFileSync(path.resolve(target), "utf-8"));
    const diff = diffEnv(baseEnv, targetEnv);
    console.log(formatDiffSummary(diff, { maskValues: opts.mask !== false }));
  });

/** merge: Merge two .env files and write the result */
program
  .command("merge <base> <override>")
  .description("Merge two .env files, with override taking precedence")
  .option("-o, --output <file>", "Output file (defaults to stdout)")
  .action((base: string, override: string, opts: { output?: string }) => {
    const baseEnv = parseEnv(fs.readFileSync(path.resolve(base), "utf-8"));
    const overrideEnv = parseEnv(fs.readFileSync(path.resolve(override), "utf-8"));
    const { merged, summary } = mergeEnv(baseEnv, overrideEnv);
    const output = serializeEnv(merged);
    if (opts.output) {
      fs.writeFileSync(path.resolve(opts.output), output, "utf-8");
      console.log(formatMergeSummary(summary));
    } else {
      console.log(output);
    }
  });

/** patch: Apply a patch (.env or JSON) to an existing .env file */
program
  .command("patch <target> <patch>")
  .description("Apply a patch file to an existing .env file")
  .action((target: string, patch: string) => {
    const summary = patchEnvFile(path.resolve(target), path.resolve(patch));
    console.log(summary);
  });

/** validate: Validate a .env file against a schema/template */
program
  .command("validate <envFile> <schema>")
  .description("Validate a .env file against a schema or .env.example template")
  .action((envFile: string, schema: string) => {
    const valid = validateEnvFileAndReport(path.resolve(envFile), path.resolve(schema));
    if (!valid) process.exit(1);
  });

/** snapshot: Save a snapshot of a .env file */
program
  .command("snapshot <envFile>")
  .description("Save a timestamped snapshot of a .env file")
  .option("-d, --dir <dir>", "Directory to store snapshots", ".env-snapshots")
  .action((envFile: string, opts: { dir: string }) => {
    const snapshotPath = snapshotEnvFile(path.resolve(envFile), path.resolve(opts.dir));
    console.log(`Snapshot saved: ${snapshotPath}`);
  });

/** snapshots list: List all snapshots for a .env file */
program
  .command("snapshots <envFile>")
  .description("List all saved snapshots for a .env file")
  .option("-d, --dir <dir>", "Directory to store snapshots", ".env-snapshots")
  .action((envFile: string, opts: { dir: string }) => {
    const snapshots = listSnapshots(path.resolve(envFile), path.resolve(opts.dir));
    if (snapshots.length === 0) {
      console.log("No snapshots found.");
    } else {
      snapshots.forEach((s) => console.log(s));
    }
  });

/** snapshot diff: Compare the two most recent snapshots */
program
  .command("snapshot-diff <envFile>")
  .description("Compare the two most recent snapshots of a .env file")
  .option("-d, --dir <dir>", "Directory to store snapshots", ".env-snapshots")
  .action((envFile: string, opts: { dir: string }) => {
    const result = compareLatestSnapshots(path.resolve(envFile), path.resolve(opts.dir));
    if (!result) {
      console.log("Not enough snapshots to compare.");
    } else {
      console.log(result);
    }
  });

/** mask: Print a .env file with sensitive values masked */
program
  .command("mask <envFile>")
  .description("Print a .env file with sensitive values masked")
  .action((envFile: string) => {
    const env = parseEnv(fs.readFileSync(path.resolve(envFile), "utf-8"));
    const masked = maskEnv(env);
    console.log(serializeEnv(masked));
  });

program.parse(process.argv);
